const multer = require('multer');
const path = require('path');



// Set up Multer for file uploads, using memory storage (for compression later)
const storage = multer.memoryStorage();

// File filter to allow only jpeg, jpg, and png files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (mimeType && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
    }
};

// Initialize Multer for file uploads
const upload = multer({
    storage: storage, // Using memoryStorage to process the image with Sharp before saving
    fileFilter: fileFilter
}).single('profile_url'); // 'profilePhoto' is the form field name

module.exports = {
    upload
};

