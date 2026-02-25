import express from 'express';
import { getSevaOptions, addSevaOption, deleteSevaOption } from '../controllers/sevaMasterController.js';

const router = express.Router();

router.get('/', getSevaOptions);
router.post('/', addSevaOption);
router.delete('/:id', deleteSevaOption);

export default router;
