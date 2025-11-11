import { Router } from "express";
import patientsRoutes from "./patients.routes";
import argocdRoutes from "./argocd.routes";
import caregiversRoutes from "./caregivers.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/patients", patientsRoutes);
router.use("/caregivers", caregiversRoutes);
router.use("/auth", authRoutes);

if (process.env.NODE_ENV == "dev") {
  router.use("/argocd", argocdRoutes);
}

export default router;
