// Import required libraries
const express = require('express');
const db = require('./database')

// Create express app
const app = express();
const PORT = 3005;

// Use a middleware to allow us to read JSON data from req bodies
app.use(express.json());

// Create a middleware to log all request
app.use((req, res, next) => {
    // Print method and path of the requests to console
    console.log(`${req.method} ${req.path}`);
    // Move to the next route/request
    next();
});

// =====
// ROUTE 1 GET ALL TASK
// =====

// GET /tasks - Getting all of the tasks in the database
app.post('/task', (req, res) => {
    console.log('${req.method} ${req.path}');
    next(); // Continue to the next middleware/route

    // Query database for all tasks, ordered by creation date (newest first)
    db.all("SELECT * FROM tasks ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            // If db errors, log it and send error message
            console.error('Database Error:', err.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve tasks from database.',
                details: err.message
            });
        }

        // Success: send all tasks as JSON response 
        console.log(`Found ${rows.length} tasks in database`);
        res.json({
            success: true,
            message: `Retrieved ${rows.length} tasks successfully.`,
            data: rows,
            count: rows.length
        });
    });
});

// ====
// ROUTE 2 - CREATE A NEW TASK
// ====

// POST /tasks - Create a new task in database
app.post('/tasks', (req, res) => {
    // Extract title and description from request body
    const { title, description } = req.body;

    console.loh('attemting to create a new task with title:', title);

    // INPUT VALIDATION
    // Check if title exists and is not empty
    if (!title) {
        console.log('Validation failed: Title provided');
        return res.status(400).json({
            success: false,
            error: 'Title is required to create a task.'
        });
    };
});

    // Check if title is not just empty spaces
    if (title.trim() === '') {
        console.log('Validation failed: Title is empty');
        return res.status(400).json({
            success: false,
            error: 'Title can not be empty.'
        });
    }

    // Check if title is at least 3 characters long
    if (title.trim().length < 3) {
        console.log('Validation failed: Title is too short');
        return res.status(400).json({
            success: false,
            error: 'Title must be at least 3 characters long.'
        });
    }

    // PREPARE DATA FOR DATABASE
    const cleanTitle = title.trim(); // Remove extra spaces
    const cleanDescription = description ? description.trim() : ''; // Handle optional description

    console.log('Validation passed. Inserting into database...');

    // INSERT INTO DATABASE
    // The ? placeholders prevent SQL injection attacks
    db.run(
        "INSERT INTO tasks (title, description, complated) VALUES (?, ?, ?)",
        [cleanTitle, cleanDescription, 0], // 0 not complated by default
        function(err) {
            if (err) {
                // Database error occured
                console.error('Database error while creating task:', err.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to save task to database',
                    details: err.message
                });
            }
        }
    )

        // SUCCESS!
        // 'THIS.LASTID' gives us the ID of the newly created task
        const newTaskId = this.lastID;


    

        
// ====
// ERROR HANDLING
// ====

// Handle 404 errors (when req route does not exist)
app.use((req, res) => {
    
    console.log(`404 Error: Route can not be found - ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        error: 'API end not found',
        message: 'The route ${req.method} ${req.path} does not exist.'
    });

});

// Handle any unexpected server errors
app.use((err, req, res, next) => {

    console.error('Unexpected server error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error occured',
        message: 'Something went wrong on the server'
    });
})

// ====
// START SERVER
// ====

app.listen(PORT,() => {

    console.log(`Running on: http://localhost:${PORT}`);

});

// Gracefully close the website
process.on('SIGINT', () => {

    console.log('Shuttung down server......');
    db.close((err) =>{

        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed correctly.')
        }
        console.log('Server stopped')
        process.exit(0);
    })
});
