const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Resolve private upload directory (excluded from git and not served as static public folder)
const uploadDir = path.resolve(
  __dirname,
  '../../',
  process.env.UPLOAD_DIR || 'uploads'
);

// Ensure private upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine with sanitized, secure filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unguessable random token + safe extension
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomHex}${ext}`);
  },
});

// Whitelist of allowed mime types for resumes and certificates
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'image/jpeg',
  'image/png',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        'Invalid file type. Only PDF, DOCX, and standard image files (PNG, JPG) are permitted.'
      ),
      false
    );
  }
  cb(null, true);
};

// Max size in MB (defaults to 5MB)
const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10);

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024,
  },
  fileFilter,
});

module.exports = {
  upload,
  uploadDir,
};
