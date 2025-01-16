const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// Helper function to compress and save the video
const compressAndSaveVideo = async (buffer, filename) => {
    const outputPath = `uploads/videos/compressed-${filename}`;
    
    return new Promise((resolve, reject) => {
        // Use buffer to save file to a temporary path
        const tempFilePath = path.join(__dirname, `../temp/${filename}`);
        require('fs').writeFileSync(tempFilePath, buffer);

        // Start ffmpeg compression
        ffmpeg(tempFilePath)
            .outputOptions([
                '-vf scale=640:360', // Resize to 640x360
                '-b:v 1000k',        // Set video bitrate to 1000k (adjust as needed)
                '-c:v libx264',      // Use H.264 encoding
                '-crf 28',           // Set Constant Rate Factor (adjust for quality)
                '-preset fast'       // Speed/quality preset
            ])
            .on('end', () => {
                resolve(outputPath);
                // Optionally remove tempFilePath after processing
                require('fs').unlinkSync(tempFilePath);
            })
            .on('error', (err) => {
                reject(new Error('Error compressing video: ' + err.message));
            })
            .save(outputPath); // Save compressed file to output path
    });
};

module.exports = {
    compressAndSaveVideo
};
