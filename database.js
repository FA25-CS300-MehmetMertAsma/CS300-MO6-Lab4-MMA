// IMport SQlite library for database operations
const sqlite3 = require('sqlite3').verbose();

// Create a new SQlite DB file called 'tasks.db'
// If the file does not alr exist, it will be created automatically
const db = new sqlite3.Database('./tasks.db', (err) => {

    if (err) {

        console.log('error opening database', err.message);

    } else {

        // Succesfully connected to the database
        console.log('Connected to SQlite database');

    }

});

// Create the task table when the DB is first set up
// This will only create the table if it does not already exist
db.serialize(() => {

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

    //Insert some sample data to start with (only if table is empty)
    db.get("SELECT COUNT(*) AS count FROM tasks", (err, row) => {
        
        if (row.count == 0)
            db.run(`INSERT INTO tasks (title, description, completed) VALUES
                ('Learn Express.js', 'Complete the express tutorial', 0),
                ('build API', 'Create a REST API WITH DATABASE', 0),
                ('Test API', 'Test all the API endpoints', 1)`);
            console.log('Sample data was inserted')
        }    
    );


            
    
});    