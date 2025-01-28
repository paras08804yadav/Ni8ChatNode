// index.js
const socketIo = require('socket.io');
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const hostRoutes = require('./routes/hostRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const { setupSocketsIo } = require('./socket1'); 
const {setSocketsio} = require('./webrtc');

dotenv.config();
const app = express();

// Read the SSL certificate and key
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/mail.hozomarketing.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/mail.hozomarketing.com/fullchain.pem'),
};

const server = https.createServer(sslOptions, app);

const io = socketIo(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
  },
});



setupSocketsIo(io);
setSocketsio(io);


// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Set static folders
app.use('/Avtar', express.static(path.join(__dirname, 'Avtar')));
app.use('/logo', express.static(path.join(__dirname, 'logo')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/agencies', agencyRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running at https://${HOST}:${PORT}`);
});
