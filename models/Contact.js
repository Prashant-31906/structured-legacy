const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    service: { 
        type: String, 
        required: false // Optional, in case user doesn't select anything
    },
    message: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Contact', contactSchema);