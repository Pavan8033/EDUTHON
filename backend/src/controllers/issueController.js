const Issue = require('../models/Issue');
const Category = require('../models/Category');

exports.createIssue = async (req, res) => {
    try {
        const { title, description, category, priority, lat, lng, address, aiPrediction } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        // Check if category exists or use default
        let issueCategory = null;
        if (category) {
            issueCategory = await Category.findById(category);
        }
        if (!issueCategory) {
            // Find a default category if invalid ID or not provided
            issueCategory = await Category.findOne();
        }

        if (!issueCategory) {
            return res.status(400).json({ message: 'No categories available in the system yet. Please contact admin.' });
        }

        const issue = await Issue.create({
            title,
            description,
            category: issueCategory._id,
            priority: priority || issueCategory.defaultPriority,
            location: { lat: parseFloat(lat), lng: parseFloat(lng), address },
            imageUrl,
            aiPrediction,
            reporter: req.user.id
        });

        // Emit real-time event
        const populatedIssue = await Issue.findById(issue._id)
            .populate('category', 'name')
            .populate('reporter', 'name email');
        if (req.io) {
            req.io.emit('issueCreated', populatedIssue);
        }

        res.status(201).json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getIssues = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'citizen') {
            filter.reporter = req.user.id;
        } else if (req.user.role === 'maintenance') {
            filter.assignedTo = req.user.id;
        }

        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;

        const issues = await Issue.find(filter)
            .populate('category', 'name')
            .populate('reporter', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find().populate('category', 'name').select('-reporter -assignedTo');
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

exports.updateIssue = async (req, res) => {
    try {
        const { status, priority, assignedTo } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        let resolvedImageUrl = issue.resolvedImageUrl;
        if (req.file) {
            resolvedImageUrl = `/uploads/${req.file.filename}`;
        }

        if (req.user.role === 'citizen' && issue.reporter.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (status) issue.status = status;
        if (priority && req.user.role === 'admin') issue.priority = priority;
        if (assignedTo && req.user.role === 'admin') issue.assignedTo = assignedTo;
        if (resolvedImageUrl) issue.resolvedImageUrl = resolvedImageUrl;

        await issue.save();

        // Emit real-time event
        const updatedIssue = await Issue.findById(issue._id)
            .populate('category', 'name')
            .populate('reporter', 'name email')
            .populate('assignedTo', 'name email');
        if (req.io) {
            req.io.emit('issueUpdated', updatedIssue);
        }

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
