import express, { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import Incident from '../models/Incident';
import { auth } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/incidents – create incident with optional photo
router.post('/', auth, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { site, employeeId, type, description, date } = req.body;
    const reportedBy = req.user._id;

    if (!site || !type || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let photoUrl: string | null = null;
    if (req.file) {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'incidents' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadApiResponse);
          }
        );
        uploadStream.end(req.file!.buffer);
      });
      photoUrl = result.secure_url;
    }

    const incident = new Incident({
      site,
      employeeId: employeeId || null,
      type,
      description,
      date: date ? new Date(date) : new Date(),
      photoUrl,
      reportedBy,
    });

    await incident.save();
    res.status(201).json({ success: true, data: incident });
  } catch (error: unknown) {
    console.error('❌ Incident creation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message });
  }
});

// GET /api/incidents?site=xxx – fetch incidents by site (admin/superadmin)
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const { site } = req.query;
    const filter: any = {};
    if (site && typeof site === 'string') {
      filter.site = site;
    }
    const incidents = await Incident.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/incidents/supervisor – fetch incidents for logged‑in supervisor
router.get('/supervisor', auth, async (req: Request, res: Response) => {
  try {
    let userId = req.user._id;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userId = new mongoose.Types.ObjectId(userId);
    }
    const incidents = await Incident.find({ reportedBy: userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

export default router;