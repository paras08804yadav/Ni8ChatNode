const multer = require('multer');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const Media = require('../models/Media');
const Host = require('../models/Host');

const unlinkAsync = promisify(fs.unlink);

// Multer setup for file uploads
const storage = multer.memoryStorage(); // Store files in memory for processing
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit: 10 MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|mp4|mov/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        if (extname && mimeType) {
            console.log('File type validation passed');
            cb(null, true);
        } else {
            console.error('Invalid file type. Only images (jpeg, jpg, png) and videos (mp4, mov) are allowed.');
            cb(new Error('Only images (jpeg, jpg, png) and videos (mp4, mov) are allowed!'));
        }
    }
}).single('mediaFile'); // 'mediaFile' is the field name for the file

// Helper function to compress and save images
const compressAndSaveImage = async (buffer, filename) => {
    const outputPath = path.join(__dirname, `../uploads/images/compressed-${Date.now()}-${filename}`);
    console.log(`Compressing image and saving to ${outputPath}`);
    await sharp(buffer)
        .resize(800, 800) // Resize image
        .jpeg({ quality: 80 }) // Compress quality to 80%
        .toFile(outputPath);
    return outputPath;
};

// Helper function to compress and save videos
const compressAndSaveVideo = (buffer, filename) => {
    const inputPath = path.join(__dirname, `../uploads/videos/input-${Date.now()}-${filename}`);
    const outputPath = path.join(__dirname, `../uploads/videos/compressed-${Date.now()}-${filename}`);

    console.log(`Saving video buffer to ${inputPath} for compression`);

    // Save buffer to a file temporarily to process with ffmpeg
    fs.writeFileSync(inputPath, buffer);

    return new Promise((resolve, reject) => {
        console.log('Starting video compression with ffmpeg');
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')  // Use H.264 video codec
            .size('640x?')          // Resize video width to 640px
            .on('end', async () => {
                console.log(`Video compression completed. Saving to ${outputPath}`);
                try {
                    await unlinkAsync(inputPath); // Delete the temporary input file
                    console.log(`Deleted temporary input file: ${inputPath}`);
                    resolve(outputPath);
                } catch (err) {
                    console.error(`Error deleting temporary input file: ${err.message}`);
                    reject(err);
                }
            })
            .on('error', (err) => {
                console.error(`Error during video compression: ${err.message}`);
                reject(err);
            })
            .run();
    });
};

// Main API function to handle media uploads
const uploadMedia = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).send(`File upload failed: ${err.message}`);
        }

        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const { host_id, media_type } = req.body;

        if (!host_id || !media_type) {
            return res.status(400).send('host_id and media_type are required');
        }

        // Validate the host
        try {
            const host = await Host.findById(host_id);
            if (!host) {
                return res.status(404).send('Host not found');
            }
        } catch (error) {
            return res.status(500).send(`Error fetching host: ${error.message}`);
        }

        try {
            let relativeFilePath; // **Variable to store the relative path**

            if (media_type === 'image') {
                const outputPath = path.join('uploads/images/', `compressed-${Date.now()}-${req.file.originalname}`);
                await sharp(req.file.buffer)
                    .resize(800, 800)
                    .jpeg({ quality: 80 })
                    .toFile(outputPath);

                relativeFilePath = `/${outputPath}`;  // **Store the relative path for the image**
            } else if (media_type === 'video') {
                const inputPath = path.join('uploads/videos/', `input-${Date.now()}-${req.file.originalname}`);
                const outputPath = path.join('uploads/videos/', `compressed-${Date.now()}-${req.file.originalname}`);

                fs.writeFileSync(inputPath, req.file.buffer);

                await new Promise((resolve, reject) => {
                    ffmpeg(inputPath)
                        .output(outputPath)
                        .videoCodec('libx264')
                        .size('640x?')
                        .on('end', async () => {
                            await unlinkAsync(inputPath);
                            resolve();
                        })
                        .on('error', reject)
                        .run();
                });

                relativeFilePath = `/${outputPath}`;  // **Store the relative path for the video**
            } else {
                return res.status(400).send('Invalid media_type. Must be "image" or "video"');
            }

            // Save media details with relative path
            const media = new Media({
                host_id,
                media_type,
                media_url: relativeFilePath,  // **Use the relative path here**
                ip_address: req.ip
            });

            await media.save();

            res.status(201).send(`${media_type} uploaded and compressed successfully`);
        } catch (error) {
            res.status(500).send(`Internal server error: ${error.message}`);
        }
    });
};




const image = async (req, res) => {
    const { host_id } = req.body;

    if (!host_id) {
        return res.status(400).json({ msg: 'Host ID is required.' });
    }

    try {
        // Find the host by host_id
        const host = await Host.findById(host_id);
        if (!host) {
            return res.status(404).json({ msg: 'Host not found.' });
        }

        // Find all media related to the host where the media_type is 'image'
        const media = await Media.find({ host_id: host_id, media_type: 'image' }).select('media_url host_id')
        .select('media_url host_id created_at')
        .sort({ created_at: -1 });

        // If no media found, return appropriate message
        if (media.length === 0) {
            return res.status(404).json({ msg: 'No images found for this host.' });
        }

        // Construct the full public URL for each media file
        const mediaWithUrl = media.map(item => ({
            media_url: `${req.protocol}://${req.get('host')}${item.media_url}`,  // Use relative media_url here
            host_id: item.host_id
        }));

        // Return the media URL and host ID
        res.status(200).json({
            msg: 'Images found',
            media: mediaWithUrl
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};




const video = async (req, res) => {
    const { host_id } = req.body;

    if (!host_id) {
        return res.status(400).json({ msg: 'Host ID is required.' });
    }

    try {
        // Find the host by host_id
        const host = await Host.findById(host_id);
        if (!host) {
            return res.status(404).json({ msg: 'Host not found.' });
        }

        // Find all media related to the host where the media_type is 'video'
        const media = await Media.find({ host_id: host_id, media_type: 'video' })
        .select('media_url host_id created_at')
        .sort({ created_at: -1 }); 

        // If no media found, return appropriate message
        if (media.length === 0) {
            return res.status(404).json({ msg: 'No videos found for this host.' });
        }

        // Construct the full public URL for each media file
        const mediaWithUrl = media.map(item => ({
            media_url: `${req.protocol}://${req.get('host')}${item.media_url}`,  // Use relative media_url here
            host_id: item.host_id
        }));

        // Return the media URL and host ID
        res.status(200).json({
            msg: 'Videos found',
            media: mediaWithUrl
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

  


module.exports = {
    uploadMedia,
    image,
    video,
};
