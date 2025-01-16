const BankVerification = require('../models/bankAccount'); // Import your schema

const bankAccountVerification = async(req,res)=> {
    try{
    
    const { host_id, bankName,accountHolderName,accountNumber,ifscCode,branchName} = req.body;
    if(!host_id, !bankName,!accountHolderName,!accountNumber,!ifscCode){
        return res.status(400).json({ msg: 'Please provide host_id, bankName, accountHolderName, accountNumber, ifscCode' });
    }
    const newBankVerification = new BankVerification({
        hostId:host_id, 
        bankName:bankName,
        accountHolderName:accountHolderName,
        accountNumber:accountNumber,
        ifscCode:ifscCode,
        verificationStatus:'Pending',
    });

    // Save to the database
    await newBankVerification.save();

    return res.status(201).json({ success: true, message: 'Bank verification data saved successfully', data: newBankVerification });
    } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error saving bank verification data', error: error.message });
    }
};

module.exports = {bankAccountVerification};