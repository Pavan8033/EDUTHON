const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    defaultPriority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
});

module.exports = mongoose.model('Category', categorySchema);
