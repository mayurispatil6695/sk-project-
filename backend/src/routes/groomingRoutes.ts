import { Router, Request, Response } from 'express';
import { getTodayGrooming, batchSaveGrooming } from '../controllers/groomingController';
import { auth } from '../middleware/auth';
import mongoose from 'mongoose';
import Grooming from '../models/Grooming';   // Import the model
import Employee from '../models/Employee';   // Import Employee model directly

const router = Router();

// Apply auth to all routes in this router
router.use(auth);

// GET /api/grooming?date=YYYY-MM-DD&site=SITENAME – fetch grooming records by site and date
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const { date, site } = req.query;
    if (!date || !site) {
      return res.status(400).json({ success: false, message: 'Date and site are required' });
    }

    // Find all employees belonging to the given site
    const employees = await Employee.find({ siteName: site as string }).select('_id');
    const employeeIds = employees.map(emp => emp._id);

    // Fetch grooming records for those employees on the given date
    const records = await Grooming.find({
      employeeId: { $in: employeeIds },
      date: date as string,
    });

    res.json({ success: true, data: records });
  } catch (error: any) {
    console.error('Error fetching grooming by site:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/grooming/today – existing route (for supervisors)
router.get('/today', getTodayGrooming);

// POST /api/grooming/batch – existing route (for supervisors)
router.post('/batch', batchSaveGrooming);

export default router;