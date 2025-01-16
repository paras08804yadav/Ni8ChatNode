
const mongoose = require('mongoose');


const TransactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User'
  },
  transactionDate: { 
    type: Date, 
    default: Date.now 
  },
  orderId: { 
    type: String, 
    required: true 
  },
  coinsBought: { 
    type: Number, 
    required: true 
  },
  amountInRupees: { 
    type: Number, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    required: true, 
    enum: ['Success', 'Failed', 'Pending'] // Define allowed values
  },
  transactionDetails: {
    transactionId: { 
      type: String, 
      required: true 
    },
    paymentGateway: { 
      type: String, 
      required: true 
    },
    paymentDate: { 
      type: Date, 
      required: true 
    }
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
