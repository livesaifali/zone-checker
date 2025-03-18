
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

// Add user route (superadmin only)
app.post('/api/users', authenticateToken, async (req, res) => {
  // Only superadmin can add users
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const { username, password, role, concernId, email } = req.body;
    
    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (username, password, role, concern_id, email) VALUES (?, ?, ?, ?, ?)',
      [username, password, role, concernId, email]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      username,
      role,
      concernId,
      email
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user route (superadmin only)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  // Only superadmin can delete users
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const userId = req.params.id;
    
    // Delete user
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user route (superadmin only)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  // Only superadmin can update users
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const userId = req.params.id;
    const { username, role, concernId, email } = req.body;
    
    // Update user
    await pool.query(
      'UPDATE users SET username = ?, role = ?, concern_id = ?, email = ? WHERE id = ?',
      [username, role, concernId, email, userId]
    );
    
    res.json({ 
      id: parseInt(userId),
      username,
      role,
      concernId,
      email
    });
  } catch (error) {
    console.error('Update user error:', error);
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
    let tasksQuery;
    let queryParams = [];
    
    if (req.user.role === 'user') {
      // For users, only show tasks assigned to their zone
      tasksQuery = `
        SELECT t.*, u.username as created_by_username 
        FROM tasks t
        JOIN users u ON t.created_by = u.id
        JOIN task_assignments ta ON t.id = ta.task_id
        WHERE ta.concern_id = ?
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
      queryParams = [req.user.concernId];
    } else {
      // For admins and superadmins, show all tasks
      tasksQuery = `
        SELECT t.*, u.username as created_by_username 
        FROM tasks t
        JOIN users u ON t.created_by = u.id
        ORDER BY t.created_at DESC
      `;
    }
    
    const [tasks] = await pool.query(tasksQuery, queryParams);
    
    // Get task assignments
    const taskIds = tasks.map(task => task.id);
    if (taskIds.length === 0) {
      return res.json([]);
    }
    
    const [assignments] = await pool.query(
      `SELECT task_id, concern_id FROM task_assignments WHERE task_id IN (?)`, 
      [taskIds]
    );
    
    // Get task comments
    const [comments] = await pool.query(`
      SELECT tc.*, u.username 
      FROM task_comments tc
      JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id IN (?)
      ORDER BY tc.created_at ASC
    `, [taskIds]);
    
    // Format tasks with assignments and comments
    const formattedTasks = tasks.map(task => {
      const taskAssignments = assignments
        .filter(a => a.task_id === task.id)
        .map(a => a.concern_id);
      
      const taskComments = comments
        .filter(c => c.task_id === task.id)
        .map(c => ({
          id: c.id,
          taskId: c.task_id,
          userId: c.user_id,
          userName: c.username,
          comment: c.comment,
          createdAt: c.created_at
        }));
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        createdBy: task.created_by,
        createdByUsername: task.created_by_username,
        createdAt: task.created_at,
        dueDate: task.due_date,
        status: task.status,
        assignedZones: taskAssignments,
        comments: taskComments.length > 0 ? taskComments : undefined
      };
    });
    
    res.json(formattedTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  // Only admin and superadmin can create tasks
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const { title, description, dueDate, assignedZones } = req.body;
    const createdBy = req.user.id;
    
    // Transaction to ensure all operations succeed or fail together
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert task
      const [taskResult] = await connection.query(
        'INSERT INTO tasks (title, description, due_date, created_by) VALUES (?, ?, ?, ?)',
        [title, description, dueDate, createdBy]
      );
      
      const taskId = taskResult.insertId;
      
      // Insert task assignments
      if (assignedZones && assignedZones.length > 0) {
        const assignmentValues = assignedZones.map(zone => [taskId, zone]);
        await connection.query(
          'INSERT INTO task_assignments (task_id, concern_id) VALUES ?',
          [assignmentValues]
        );
      }
      
      await connection.commit();
      
      res.status(201).json({
        id: taskId,
        title,
        description,
        createdBy,
        createdAt: new Date(),
        dueDate,
        status: 'pending',
        assignedZones
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

app.put('/api/tasks/:id/status', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    
    // Check if user has permission for this task
    if (req.user.role === 'user') {
      const [assignments] = await pool.query(`
        SELECT ta.* FROM task_assignments ta
        WHERE ta.task_id = ? AND ta.concern_id = ?
      `, [taskId, req.user.concernId]);
      
      if (assignments.length === 0) {
        return res.status(403).json({ message: 'You can only update tasks assigned to your zone' });
      }
    }
    
    // Update task status
    await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, taskId]
    );
    
    res.json({ id: parseInt(taskId), status });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks/:id/comments', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { comment } = req.body;
    const userId = req.user.id;
    
    // Check if user has permission for this task
    if (req.user.role === 'user') {
      const [assignments] = await pool.query(`
        SELECT ta.* FROM task_assignments ta
        WHERE ta.task_id = ? AND ta.concern_id = ?
      `, [taskId, req.user.concernId]);
      
      if (assignments.length === 0) {
        return res.status(403).json({ message: 'You can only comment on tasks assigned to your zone' });
      }
    }
    
    // Insert comment
    const [result] = await pool.query(
      'INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [taskId, userId, comment]
    );
    
    // Get username for response
    const [users] = await pool.query('SELECT username FROM users WHERE id = ?', [userId]);
    
    res.status(201).json({
      id: result.insertId,
      taskId: parseInt(taskId),
      userId,
      userName: users[0].username,
      comment,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Add task comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  // Only admin and superadmin can delete tasks
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    const taskId = req.params.id;
    
    // Check if task was created by this admin (superadmin can delete any task)
    if (req.user.role === 'admin') {
      const [tasks] = await pool.query(
        'SELECT * FROM tasks WHERE id = ? AND created_by = ?',
        [taskId, req.user.id]
      );
      
      if (tasks.length === 0) {
        return res.status(403).json({ message: 'You can only delete tasks you created' });
      }
    }
    
    // Delete task - cascade will delete assignments and comments
    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reporting endpoints
app.get('/api/reports/task-status', authenticateToken, async (req, res) => {
  try {
    const { timeframe } = req.query;
    let dateFilter = '';
    
    switch(timeframe) {
      case 'daily':
        dateFilter = 'AND DATE(t.created_at) = CURDATE()';
        break;
      case 'weekly':
        dateFilter = 'AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        break;
      case '15days':
        dateFilter = 'AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 15 DAY)';
        break;
      case 'monthly':
        dateFilter = 'AND MONTH(t.created_at) = MONTH(CURDATE()) AND YEAR(t.created_at) = YEAR(CURDATE())';
        break;
      default:
        dateFilter = '';
    }
    
    const [results] = await pool.query(`
      SELECT 
        DATE(t.created_at) as date,
        COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN t.status = 'updated' THEN 1 END) as updated
      FROM tasks t
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(t.created_at)
      ORDER BY DATE(t.created_at)
    `);
    
    res.json(results);
  } catch (error) {
    console.error('Task status report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/reports/zone-performance', authenticateToken, async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        c.name as zoneName,
        c.concern_id as concernId,
        COUNT(DISTINCT t.id) as totalTasks,
        COUNT(DISTINCT CASE WHEN t.status = 'updated' THEN t.id END) as completedTasks
      FROM cities c
      LEFT JOIN task_assignments ta ON c.concern_id = ta.concern_id
      LEFT JOIN tasks t ON ta.task_id = t.id
      GROUP BY c.name, c.concern_id
      ORDER BY completedTasks DESC
    `);
    
    res.json(results);
  } catch (error) {
    console.error('Zone performance report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password endpoint
app.put('/api/users/:id/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    
    // Only superadmin can change other users' passwords
    if (parseInt(userId) !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Get user from database
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Verify current password (not needed for superadmin changing others' passwords)
    if (parseInt(userId) === req.user.id) {
      let passwordValid = false;
      if (user.password_is_hashed) {
        passwordValid = await bcrypt.compare(currentPassword, user.password);
      } else {
        passwordValid = currentPassword === user.password;
      }
      
      if (!passwordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = ?, password_is_hashed = 1 WHERE id = ?',
      [hashedPassword, userId]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
