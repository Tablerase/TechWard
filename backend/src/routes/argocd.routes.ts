import { Router } from "express";
import { updateAppController, imageAppController } from "../controllers/argocd.controller";

const router = Router();

router.post("/update-app", updateAppController);
router.post("/image", imageAppController);

export default router;
