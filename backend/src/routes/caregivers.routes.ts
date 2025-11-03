import { Router } from "express";
import * as caregiversController from "@controllers/caregivers.controller";

const router = Router();

router.get("/", caregiversController.getCaregivers);

if (process.env.NODE_ENV === 'dev') {
  router.post("/", caregiversController.addCaregiver);
}

export default router;
