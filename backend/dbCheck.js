
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseConnection() {
  try {
    console.log('Attempting to connect to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_DATABASE}`);
    console.log(`User: ${process.env.DB_USERNAME}`);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'zone_checker_db'
    });
    
    console.log('Database connection successful!');
    
    // Test query to make sure we can read data
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:');
    rows.forEach(row => {
      console.log(`- ${Object.values(row)[0]}`);
    });
    
    // Check if tasks table exists and has data
    const [tasksCheck] = await connection.execute('SELECT COUNT(*) as count FROM tasks');
    console.log(`Number of tasks in database: ${tasksCheck[0].count}`);
    
    // Check if cities/zones table exists and has data
    const [zonesCheck] = await connection.execute('SELECT COUNT(*) as count FROM cities');
    console.log(`Number of cities/zones in database: ${zonesCheck[0].count}`);
    
    connection.end();
    console.log('Connection closed.');
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error(error);
    return false;
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkDatabaseConnection()
    .then(success => {
      if (success) {
        console.log('Database check completed successfully.');
      } else {
        console.log('Database check failed.');
      }
    })
    .catch(err => {
      console.error('Unexpected error during database check:', err);
    });
}

module.exports = { checkDatabaseConnection };
