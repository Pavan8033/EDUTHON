const Issue = require('../models/Issue');
const User = require('../models/User');

exports.getAnalytics = async (req, res) => {
    try {
        const totalIssues = await Issue.countDocuments();
        const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
        const inProgressIssues = await Issue.countDocuments({ status: { $in: ['Assigned', 'In Progress'] } });
        const pendingIssues = await Issue.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } });

        // Issues by category
        const issuesByCategory = await Issue.aggregate([
            { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryDetails' } },
            { $unwind: '$categoryDetails' },
            { $group: { _id: '$categoryDetails.name', count: { $sum: 1 } } }
        ]);

        // Issues by status count
        const issuesByStatus = await Issue.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Department Performance (Count of resolved issues by maintenance user)
        const departmentPerformance = await Issue.aggregate([
            { $match: { status: 'Resolved', assignedTo: { $exists: true, $ne: null } } },
            { $lookup: { from: 'users', localField: 'assignedTo', foreignField: '_id', as: 'assigneeDetails' } },
            { $unwind: '$assigneeDetails' },
            { $group: { _id: '$assigneeDetails.name', resolvedCount: { $sum: 1 } } }
        ]);

        res.json({
            overview: { totalIssues, resolvedIssues, inProgressIssues, pendingIssues },
            issuesByCategory,
            issuesByStatus,
            departmentPerformance
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
