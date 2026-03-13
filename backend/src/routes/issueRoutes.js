const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createIssue, getIssues, getAllIssues, updateIssue } = require('../controllers/issueController');
const { protect, adminOrMaintenance, adminOnly } = require('../middleware/authMiddleware');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

router.route('/')
    .post(protect, upload.single('image'), createIssue)
    .get(protect, getIssues);

router.get('/all', getAllIssues);
router.put('/:id', protect, upload.single('resolveImage'), updateIssue);

module.exports = router;
