import express from 'express';
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  searchMembers,
  getFamilyMembers,
  updateMemberPower
} from '../controllers/memberController.js';

const router = express.Router();

// Get all members
router.get('/', getAllMembers);

// Update member power/permissions
router.patch('/:id/power', updateMemberPower);

// Get family members for a specific user
router.get('/family/:userId', getFamilyMembers);

// Search members
router.get('/search', searchMembers);

// Get single member
router.get('/:id', getMemberById);

// Create member
router.post('/', createMember);

// Update member
router.put('/:id', updateMember);

// Delete member
router.delete('/:id', deleteMember);

export default router;
