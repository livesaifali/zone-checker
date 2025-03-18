
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'zone_checker_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Check database connection
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'Database connected', timestamp: new Date() });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Get user from database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // For initial setup, allow plain text passwords
    let passwordValid = false;
    if (user.password_is_hashed) {
      // Check hashed password
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text comparison (for initial setup)
      passwordValid = password === user.password;
      
      // Optionally, update to hashed password here if needed
      // const hashedPassword = await bcrypt.hash(password, 10);
      // await pool.query('UPDATE users SET password = ?, password_is_hashed = 1 WHERE id = ?', [hashedPassword, user.id]);
    }
    
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate token
    const token = jwt.sign({ 
      id: user.id,
      username: user.username,
      role: user.role,
      concernId: user.concern_id
    }, JWT_SECRET, { expiresIn: '24h' });
    
    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, role, concern_id, email, last_login FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User routes
app.get('/api/users', authenticateToken, async (req, res) => {
  // Only admin can get all users
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const [users] = await pool.query(
      'SELECT id, username, role, concern_id, email, last_login FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// City routes
app.get('/api/cities', authenticateToken, async (req, res) => {
  try {
    const [cities] = await pool.query(`
      SELECT c.id, c.name, c.concern_id, 
        s.status, s.comment, s.updated_at, 
        u.username as updated_by
      FROM cities c
      LEFT JOIN (
        SELECT * FROM status_updates
        WHERE (city_id, updated_at) IN (
          SELECT city_id, MAX(updated_at) 
          FROM status_updates 
          GROUP BY city_id
        )
      ) s ON c.id = s.city_id
      LEFT JOIN users u ON s.updated_by = u.id
      ORDER BY c.name ASC
    `);
    
    res.json(cities);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/cities', authenticateToken, async (req, res) => {
  // Only admin can create cities
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const { name } = req.body;
    
    // Generate concern_id from name
    const prefix = name.substring(0, 3).toUpperCase();
    
    // Find highest number suffix for this prefix
    const [existing] = await pool.query(
      'SELECT concern_id FROM cities WHERE concern_id LIKE ?',
      [`${prefix}%`]
    );
    
    let nextNum = 1;
    if (existing.length > 0) {
      const suffixes = existing.map(city => {
        const suffix = city.concern_id.substring(3);
        return parseInt(suffix, 10);
      });
      nextNum = Math.max(...suffixes) + 1;
    }
    
    const concernId = `${prefix}${nextNum.toString().padStart(3, '0')}`;
    
    // Insert new city
    const [result] = await pool.query(
      'INSERT INTO cities (name, concern_id) VALUES (?, ?)',
      [name, concernId]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      name,
      concernId
    });
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Status update routes
app.post('/api/status-update', authenticateToken, async (req, res) => {
  try {
    const { city_id, status, comment } = req.body;
    const updated_by = req.user.id;
    
    // Check if user has permission for this city
    if (req.user.role === 'user') {
      const [cities] = await pool.query(
        'SELECT * FROM cities WHERE id = ? AND concern_id = ?',
        [city_id, req.user.concernId]
      );
      
      if (cities.length === 0) {
        return res.status(403).json({ message: 'You can only update your assigned city' });
      }
    }
    
    // Insert status update
    const [result] = await pool.query(
      'INSERT INTO status_updates (city_id, status, comment, updated_by) VALUES (?, ?, ?, ?)',
      [city_id, status, comment, updated_by]
    );
    
    // Also insert into history table
    await pool.query(
      'INSERT INTO status_history (city_id, status, comment, updated_by, updated_at) VALUES (?, ?, ?, ?, NOW())',
      [city_id, status, comment, updated_by]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      city_id,
      status,
      comment,
      updated_by,
      updated_at: new Date()
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/status-history/:cityId', authenticateToken, async (req, res) => {
  try {
    const cityId = req.params.cityId;
    
    const [history] = await pool.query(`
      SELECT h.id, h.status, h.comment, h.updated_at, u.username as updated_by
      FROM status_history h
      JOIN users u ON h.updated_by = u.id
      WHERE h.city_id = ?
      ORDER BY h.updated_at DESC
    `, [cityId]);
    
    res.json(history);
  } catch (error) {
    console.error('Status history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Task routes
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    let tasks;
    
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      // Admin sees all tasks
      const [result] = await pool.query(`
        SELECT t.*, u.username as creator_name
        FROM tasks t
        JOIN users u ON t.created_by = u.id
        ORDER BY t.created_at DESC
      `);
      tasks = result;
    } else {
      // Users only see tasks assigned to their zone
      const [result] = await pool.query(`
        SELECT t.*, u.username as creator_name
        FROM tasks t
        JOIN users u ON t.created_by = u.id
        JOIN task_assignments ta ON t.id = ta.task_id
        WHERE ta.concern_id = ?
        ORDER BY t.created_at DESC
      `, [req.user.concernId]);
      tasks = result;
    }
    
    // Get task assignments for each task
    for (let task of tasks) {
      const [assignments] = await pool.query(
        'SELECT concern_id FROM task_assignments WHERE task_id = ?',
        [task.id]
      );
      task.assignedZones = assignments.map(a => a.concern_id);
      
      // Get comments for each task
      const [comments] = await pool.query(`
        SELECT c.id, c.task_id, c.user_id, u.username as user_name, c.comment, c.created_at
        FROM task_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at DESC
      `, [task.id]);
      task.comments = comments;
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  // Only admin can create tasks
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const { title, description, dueDate, assignedZones } = req.body;
    const created_by = req.user.id;
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insert task
      const [result] = await connection.query(
        'INSERT INTO tasks (title, description, due_date, created_by, status) VALUES (?, ?, ?, ?, ?)',
        [title, description, dueDate, created_by, 'pending']
      );
      
      const taskId = result.insertId;
      
      // Insert task assignments
      for (let zoneId of assignedZones) {
        await connection.query(
          'INSERT INTO task_assignments (task_id, concern_id) VALUES (?, ?)',
          [taskId, zoneId]
        );
      }
      
      await connection.commit();
      
      res.status(201).json({
        id: taskId,
        title,
        description,
        dueDate,
        createdBy: created_by,
        status: 'pending',
        assignedZones,
        createdAt: new Date(),
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    
    // Check if task exists and user has permission
    let canUpdate = false;
    
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      canUpdate = true;
    } else {
      const [assignments] = await pool.query(
        'SELECT * FROM task_assignments WHERE task_id = ? AND concern_id = ?',
        [taskId, req.user.concernId]
      );
      canUpdate = assignments.length > 0;
    }
    
    if (!canUpdate) {
      return res.status(403).json({ message: 'You do not have permission to update this task' });
    }
    
    // Update task status
    await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, taskId]
    );
    
    res.json({ id: taskId, status });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks/:id/comments', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { comment } = req.body;
    const userId = req.user.id;
    
    // Check if user has permission to comment on this task
    let canComment = false;
    
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      canComment = true;
    } else {
      const [assignments] = await pool.query(
        'SELECT * FROM task_assignments WHERE task_id = ? AND concern_id = ?',
        [taskId, req.user.concernId]
      );
      canComment = assignments.length > 0;
    }
    
    if (!canComment) {
      return res.status(403).json({ message: 'You do not have permission to comment on this task' });
    }
    
    // Insert comment
    const [result] = await pool.query(
      'INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [taskId, userId, comment]
    );
    
    const [user] = await pool.query(
      'SELECT username FROM users WHERE id = ?',
      [userId]
    );
    
    res.status(201).json({
      id: result.insertId,
      taskId,
      userId,
      userName: user[0].username,
      comment,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
