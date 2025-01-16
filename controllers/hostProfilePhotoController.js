const multer = require('multer');
const path = require('path');


// Configure multer storage for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_photos'); // Directory where images will be saved
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = req.body.userId + '_' + Date.now() + ext; // Custom file name
    cb(null, filename);
  }
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};


const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Max size 5MB
  fileFilter: fileFilter
});

