// routes/attendanceRoutes.ts
import express from 'express';
import {
  checkIn,
  checkOut,
  checkInWithPhoto,
  checkOutWithPhoto,
  breakIn,
  breakOut,
  getTodayStatus,
  getAttendanceHistory,
  getTeamAttendance,
  getAllAttendance,
  updateAttendance,
  getWeeklySummary,
  manualAttendance,
  updateAttendanceStatus,
  upload,
  faceRecognize,
  registerFace ,
  getGeofenceBreaches,updateEmployeeLocation,autoAttendance,
} from '../controllers/attendanceController';

const router = express.Router();

// Check in/out routes
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);

// Check in/out with photo routes
router.post('/checkin-with-photo', upload.single('photo'), checkInWithPhoto);
router.post('/checkout-with-photo', upload.single('photo'), checkOutWithPhoto);

// Break routes
router.post('/breakin', breakIn);
router.post('/breakout', breakOut);

// Get attendance data
router.get('/status/:employeeId', getTodayStatus);
router.get('/history', getAttendanceHistory);
router.get('/team', getTeamAttendance);
router.get('/', getAllAttendance);
router.post('/face-recognize', upload.single('photo'), faceRecognize);
router.post('/register-face/:employeeId', upload.single('photo'), registerFace);
// Update attendance (admin/supervisor)
router.put('/:id', updateAttendance);
router.post('/auto-attendance', upload.single('photo'), autoAttendance);
// Update attendance status (admin/supervisor)
router.post('/update-status', updateAttendanceStatus);


// Geofencing routes
router.post('/update-location', updateEmployeeLocation);
router.get('/geofence-breaches', getGeofenceBreaches);
// Manual attendance entry
router.post('/manual', manualAttendance);
router.get('/weekly-summary', getWeeklySummary);
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Attendance router works' });
});
export default router;