import express from "express";
import {getAIResponse,getSeedDetailsByName,selectSeed} from "../controllers/seedDiscussion.js";

const router=express.Router();

router.post("/chat",getAIResponse);
router.post("/selectSeed",selectSeed);
router.post("/seedDetails",getSeedDetailsByName);

export default router;