import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/authMiddleware';

const router = Router();

// For simplicity, storing files on the local filesystem.
// In a real app, you would use a cloud storage service like S3.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', authMiddleware, upload.single('file'), (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // The file is available at req.file
  // We're returning the path to the file. In a real app, you'd return a URL.
  const filePath = `/uploads/${req.file.filename}`;
  
  res.status(201).json({ path: filePath });
});

export default router;
