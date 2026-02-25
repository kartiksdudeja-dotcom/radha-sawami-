import express from 'express';
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  searchMembers
} from '../controllers/memberController.js';

const router = express.Router();

// Get all members
router.get('/', getAllMembers);

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
