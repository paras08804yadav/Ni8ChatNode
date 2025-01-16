const multer = require('multer');
const path = require('path');

// Set up Multer for file uploads, using memory storage (for compression later)
const storage = multer.memoryStorage();

// File filter to allow only mp4 and avi files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /mp4|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (mimeType && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only videos (mp4, avi) are allowed!'));
    }
};

// Initialize Multer for file uploads
const uploadVideo = multer({
    storage: storage, // Using memoryStorage to process the video with ffmpeg before saving
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB file size limit
    fileFilter: fileFilter
}).single('videoMedia'); // 'videoMedia' is the form field name

module.exports = {
    uploadVideo
};
