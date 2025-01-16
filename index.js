// index.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); 
const multer = require('multer');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const hostRoutes = require('./routes/hostRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const http = require('http');
const { setupSocketIo, sendMessage } = require('./app'); // Import socket setup and controller function




dotenv.config();
const app = express();
const server = http.createServer(app);
const io = setupSocketIo(server); // Initialize Socket.IO

app.use((req, res, next) => {
    req.io = io;
    next();
  });

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use('/Avtar', express.static(path.join(__dirname, 'Avtar')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Connect to MongoDB
connectDB();


//upload


// Mount user routes
app.use('/api/users', userRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/agencies', agencyRoutes);


const PORT = process.env.PORT || 5000;
const HOST = 'localhost'; 

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
}); 