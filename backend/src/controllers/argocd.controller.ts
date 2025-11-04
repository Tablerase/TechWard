import { Request, Response } from "express";
import { getDeploymentImage, updateDeployment } from "@services/index.service";

export async function updateAppController(req: Request, res: Response) {
  const { tag } = req.body as { tag?: string };

  if (!tag) {
    return res.status(400).json({ error: "Missing 'tag' in request body" });
  }

  try {
    await updateDeployment(tag);
    res.json({ status: "success", message: `Updated image to ${tag}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: (err as Error).message });
  }
}

export async function imageAppController(req: Request, res: Response) {
  const { namespace, deploymentName } = req.body as { namespace?: string, deploymentName?: string };

  if (!namespace) {
    return res.status(400).json({ error: "Missing 'namespace' in request body" });
  }
  if (!deploymentName) {
    return res.status(400).json({ error: "Missing 'deploymentName' in request body" });
  }

  try {
    const image = await getDeploymentImage(namespace, deploymentName)
    res.json({ status: "success", message: image })
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: (err as Error).message });
  }
}
