import { Router } from "express";
import patientsRoutes from "./patients.routes";
import argocdRoutes from "./argocd.routes";
import caregiversRoutes from "./caregivers.routes";

const router = Router();

router.use("/patients", patientsRoutes);
router.use("/caregivers", caregiversRoutes);

if (process.env.NODE_ENV == "dev") {
  router.use("/argocd", argocdRoutes);
}

export default router;
