import {
  getReferSettings,
  updateReferSettings,
} from "../controller/referSetting.controller.js";

import express from "express";

const router = express.Router();

router.get("/get-refer", getReferSettings);
router.put("/update", updateReferSettings); // admin side update

export default router;
