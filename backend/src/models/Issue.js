const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'], default: 'Submitted' },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    imageUrl: { type: String }, // User's initial report
    resolvedImageUrl: { type: String }, // Maintenance's fix
    aiPrediction: { type: String }, // AI Object Detection Result
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
