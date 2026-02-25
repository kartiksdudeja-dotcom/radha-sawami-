import express from 'express';
import { 
  saveSevaEntry, 
  getAllSevaEntries, 
  getSevaEntriesByMember,
  getSevaReport,
  deleteSevaEntry 
} from '../controllers/sevaController.js';

const router = express.Router();

// POST /api/seva - Save seva entry
router.post('/', saveSevaEntry);

// GET /api/seva - Get all seva entries
router.get('/', getAllSevaEntries);

// GET /api/seva/report - Get seva report (members with activities)
router.get('/report', getSevaReport);

// GET /api/seva/member/:memberId - Get seva entries by member
router.get('/member/:memberId', getSevaEntriesByMember);

// DELETE /api/seva/:id - Delete seva entry
router.delete('/:id', deleteSevaEntry);

export default router;
