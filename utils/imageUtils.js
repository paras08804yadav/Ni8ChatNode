const sharp = require('sharp');
const path = require('path');

// Helper function to compress and save the image
const compressAndSaveImage = async (buffer, filename) => {
    const outputPath = `uploads/profile_photo/${filename}.jpg`;
    await sharp(buffer)
        .resize(300, 300) // Resize the image to 300x300
        .jpeg({ quality: 80 }) // Compress the image with 80% quality
        .toFile(outputPath); // Save to file system
    return outputPath;
};

module.exports = {
    compressAndSaveImage
};
