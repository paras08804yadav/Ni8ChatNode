const multer = require('multer');
const path = require('path');
const Host = require('../models/Host'); 
const Agency = require('../models/Agency');
const Kyc = require('../models/Kyc');
const fs = require('fs');

// Ensure the folders exist
const ensureFolderExists = (folder) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
};

// Create folders for front and back ID proofs
ensureFolderExists('uploads/Kyc/front_id');
ensureFolderExists('uploads/Kyc/back_id');

// Multer setup for image uploads with separate directories for front and back ID proofs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Store front ID in 'uploads/Kyc/front_id' and back ID in 'uploads/Kyc/back_id'
        if (file.fieldname === 'front_id_proof') {
            cb(null, 'uploads/Kyc/front_id');
        } else if (file.fieldname === 'back_id_proof') {
            cb(null, 'uploads/Kyc/back_id');
        } else {
            cb(new Error('Invalid field name'), false);
        }
    },
    filename: function (req, file, cb) {
        const { full_name } = req.body; // Get full_name from the request body
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);

        // Sanitize the full_name to remove spaces and attach 'front' or 'back' accordingly
        const sanitizedFullName = full_name.replace(/\s+/g, '_');
        let fileName;

        if (file.fieldname === 'front_id_proof') {
            fileName = `${sanitizedFullName}_front_${timestamp}${ext}`; // full_name_front_timestamp.extension
        } else if (file.fieldname === 'back_id_proof') {
            fileName = `${sanitizedFullName}_back_${timestamp}${ext}`;  // full_name_back_timestamp.extension
        }

        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg, and .jpeg format allowed!'));
        }
    }
});



const submitKyc = async (req, res) => {
    const { host_id, full_name, address, phone_number, agency_id, id_type } = req.body;

    // Validate all required fields are present
    if (!host_id || !full_name || !address || !phone_number || !agency_id || !id_type) {
        return res.status(400).json({ msg: 'All fields are required.' });
    }

    // Validate that files for front and back ID proof are uploaded
    if (!req.files || !req.files.front_id_proof || !req.files.back_id_proof) {
        return res.status(400).json({ msg: 'Both front and back ID proofs are required.' });
    }

    try {
        // Check if the host exists in the Host collection
        const host = await Host.findById(host_id);
        if (!host) {
            return res.status(404).json({ msg: 'Host not found' });
        }

        // Check if the agency exists in the Agency collection
        const agency = await Agency.findById(agency_id);
        if (!agency) {
            return res.status(404).json({ msg: 'Agency not found' });
        }

        // Get the file names saved by multer
        const frontIdProofFileName = req.files.front_id_proof[0].filename;
        const backIdProofFileName = req.files.back_id_proof[0].filename;

        // Save KYC form data to the database with relative paths
        const newKyc = new Kyc({
            host_id,
            full_name,
            address,
            phone_number,
            agency_id,
            id_type,
            front_id_proof: `uploads/Kyc/front_id/${frontIdProofFileName}`, 
            back_id_proof: `uploads/Kyc/back_id/${backIdProofFileName}`,
        });

        await newKyc.save();
        res.status(201).json({ msg: 'KYC form submitted successfully!' });

    } catch (error) {
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
};


// Usage: call `upload.fields` where needed
const handleKycUpload = upload.fields([
    { name: 'front_id_proof', maxCount: 1 },
    { name: 'back_id_proof', maxCount: 1 }
]);


module.exports = {
    submitKyc,
    handleKycUpload,
};
