import { Router, Request, Response } from 'express';
import { auth } from '../middleware/auth';
import {
  getShifts,
  getShift,
  createShift,
  updateShift,
  deleteShift,
  assignEmployeeToShift,
  removeEmployeeFromShift,
  getShiftStats
} from '../controllers/shiftController';
import SiteShiftDeployment from '../models/SiteShiftDeployment';

const router = Router();

// ==================== Shift Deployment (site‑wide) ====================
// MUST be BEFORE any /:id routes

router.get('/site-deployment', auth, async (req: Request, res: Response) => {
  try {
    const { site, date } = req.query;
    if (!site || typeof site !== 'string') {
      return res.status(400).json({ success: false, message: 'Site name required' });
    }
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, message: 'Date required' });
    }
    const deployment = await SiteShiftDeployment.findOne({ site, date });
    res.json({
      success: true,
      data: { text: deployment?.text || 'No shift deployment information available.' }
    });
  } catch (error) {
    console.error('Error fetching site deployment:', error);
    res.status(500).json({ success: false, message: String(error) });
  }
});

router.post('/site-deployment', auth, async (req: Request, res: Response) => {
  try {
    const { site, date, text } = req.body;
    if (!site) {
      return res.status(400).json({ success: false, message: 'Site name required' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date required' });
    }
    await SiteShiftDeployment.findOneAndUpdate(
      { site, date },
      { text, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Site shift deployment saved' });
  } catch (error) {
    console.error('Error saving site deployment:', error);
    res.status(500).json({ success: false, message: String(error) });
  }
});

// ==================== Shift Management (CRUD) ====================
// These come AFTER the specific routes

router.get('/', getShifts);
router.get('/stats', getShiftStats);
router.get('/:id', getShift);
router.post('/', createShift);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);
router.post('/:id/assign', assignEmployeeToShift);
router.post('/:id/remove', removeEmployeeFromShift);

export default router;