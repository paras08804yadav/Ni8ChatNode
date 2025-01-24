const mongoose = require('mongoose');

const agencyKycSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    agency_code:{
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
    alternate_num: {
        type: String
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
        type: String, 
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const agencyKyc = mongoose.model('agencyKyc', agencyKycSchema);
module.exports = agencyKyc;
