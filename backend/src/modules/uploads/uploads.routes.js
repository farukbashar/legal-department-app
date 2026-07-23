const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth.middleware');

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB cap
});

router.use(requireAuth);

// POST /api/uploads  (multipart/form-data, field name "file")
// Returns { fileName, fileUrl } — fileUrl is ready to hand straight to any
// module's "link a document" endpoint (contract versions, board resolution
// documents, knowledge base items, etc).
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(201).json({
    fileName: req.file.originalname,
    fileUrl,
  });
});

module.exports = router;
