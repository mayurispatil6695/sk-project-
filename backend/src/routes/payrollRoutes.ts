// src/routes/payrollRoutes.ts
import express from 'express';
import * as payrollController from '../controllers/payrollController';

const router = express.Router();

// ✅ SPECIFIC routes MUST come before /:id (wildcard)
router.get('/', payrollController.getAllPayroll);
router.get('/summary', payrollController.getPayrollSummary);       // was being caught by /:id
router.get('/export', payrollController.exportPayroll);            // was being caught by /:id
router.get('/employee/:employeeId/month/:month', payrollController.getPayrollByEmployeeAndMonth);

router.post('/process', payrollController.processPayroll);
router.post('/bulk-process', payrollController.bulkProcessPayroll);

// ✅ Wildcard /:id routes LAST
router.get('/:id', payrollController.getPayrollById);
router.put('/:id/payment-status', payrollController.updatePaymentStatus);
router.delete('/:id', payrollController.deletePayroll);

export default router;