const mongoose = require('mongoose');

const KycSchema = new mongoose.Schema({
    host_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    agency_id: {
        type: String,
        required: true
    },
    id_type: {
        type: String,
        enum: ['Passport', 'Driving license', 'Aadhar Card'], 
        required: true
    },
    front_id_proof: {
        type: String, 
        required: true
    },
    back_id_proof: {
        type: String, // This will store the image path for the back ID proof
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Kyc = mongoose.model('Kyc', KycSchema);
module.exports = Kyc;
