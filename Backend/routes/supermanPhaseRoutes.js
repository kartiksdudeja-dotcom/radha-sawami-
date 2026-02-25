import express from "express";
import { getPhases, addPhase, updatePhase, deletePhase } from "../controllers/supermanPhaseController.js";

const router = express.Router();

router.get("/", getPhases);
router.post("/", addPhase);
router.put("/:id", updatePhase);
router.delete("/:id", deletePhase);

export default router;
