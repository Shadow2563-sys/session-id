const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");

const __path = process.cwd();
const PORT = 8888; // Set to 8888

// Increase event listeners limit
require('events').EventEmitter.defaultMaxListeners = 590;

// Import route handlers
const qrRouter = require('./qr');
const pairRouter = require('./pair');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__path, 'public')));

// Routes
app.use('/qr', qrRouter);
app.use('/code', pairRouter);

// HTML routes
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, 'pair.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__path, 'main.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oblivion System Error: Protocol Failure');
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ██████╗ ██████╗ ██╗     ██╗   ██╗██╗ ██████╗ ██████╗ ███╗   ██╗
    ██╔══██╗██╔══██╗██║     ██║   ██║██║██╔════╝██╔═══██╗████╗  ██║
    ██████╔╝██████╔╝██║     ██║   ██║██║██║     ██║   ██║██╔██╗ ██║
    ██╔═══╝ ██╔══██╗██║     ╚██╗ ██╔╝██║██║     ██║   ██║██║╚██╗██║
    ██║     ██║  ██║███████╗ ╚████╔╝ ██║╚██████╗╚██████╔╝██║ ╚████║
    ╚═╝     ╚═╝  ╚═╝╚══════╝  ╚═══╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝
    
    Oblivion Network Active
    Port: ${PORT}
    Access: http://localhost:${PORT}
    `);
});
