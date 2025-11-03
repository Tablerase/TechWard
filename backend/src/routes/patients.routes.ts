import { Router } from "express";
import * as patientsController from "@controllers/patients.controller";

const router = Router();

router.get("/", patientsController.getPatients);
router.get("/:id/", patientsController.getPatient);
router.post("/:id/problems", patientsController.addProblem);
router.patch(
  "/:id/problems/:problemId",
  patientsController.updateProblemStatus,
);
router.post(
  "/:id/problems/:problemId/resolve",
  patientsController.resolveProblem,
);

export default router;
