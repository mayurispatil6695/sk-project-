import { Request, Response } from 'express';
import Grooming from '../models/Grooming';
import Task from '../models/Task';
import Employee from '../models/Employee';

export const getTodayGrooming = async (req: Request, res: Response) => {
  try {
    const supervisorId = (req as any).userId;   // ✅ Use userId from auth
    if (!supervisorId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // Get supervisor's site names (match your actual task schema)
    const tasks = await Task.find({
      $or: [
        { 'assignedUsers.userId': supervisorId },
        { assignedTo: supervisorId }
      ]
    }).select('siteName');

    const siteNames = [...new Set(tasks.map(t => t.siteName).filter(Boolean))];

    const employees = await Employee.find({
      siteName: { $in: siteNames },
      status: 'active'
    }).select('_id name employeeId siteName');

    const employeeIds = employees.map(e => e._id);
    const today = new Date().toISOString().split('T')[0];
    const records = await Grooming.find({ employeeId: { $in: employeeIds }, date: today });

    res.json({ success: true, data: records });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const batchSaveGrooming = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Invalid records' });
    }

    const today = new Date().toISOString().split('T')[0];
    const supervisorId = (req as any).userId;

    const operations = records.map(record => ({
      updateOne: {
        filter: { employeeId: record.employeeId, date: today },
        update: {
          $set: {
            ...record,
            date: today,
            supervisorId,
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    await Grooming.bulkWrite(operations);
    res.json({ success: true, message: 'Grooming status saved' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};