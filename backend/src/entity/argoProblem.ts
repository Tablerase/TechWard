import { getDeploymentImage } from "@services/kubernetes.service";
import { Problem } from "./problem";
import { allowedTags, updateDeployment } from "@services/argoDemo.service";

if (!process.env.ARGOCD_DEMO_APPLICATION_NAME) { throw new Error("Missing argo demo application name in env") }
if (!process.env.ARGOCD_DEMO_NAMESPACE) { throw new Error("Missing argo demo namespace in env") }

export class ArgoProblem extends Problem {
  private cooldown: number = 180000; // 3 min : max argo sync time , delay avoid to many resources usage

  /**
   * Creates a new Argo Problem instance.
   * @param description - A brief description of the problem.
   */
  constructor(
    description: string,
  ) {
    super('argoPb', description, "argo", 'serious')
  }

  waitBeforeReset() {
    setTimeout(() => {
      this.reset('serious');
    },
      this.cooldown);
  }

  async resolve(): Promise<void> {
    if (this.status == "resolved") {
      return;
    }
    const image = await getDeploymentImage(process.env.ARGOCD_DEMO_NAMESPACE, process.env.ARGOCD_DEMO_APPLICATION_NAME);
    const newTag = allowedTags.find(value => !image?.includes(value))
    await updateDeployment(newTag);
    this.status = "resolved";
    this.release();
    this.waitBeforeReset();
  }
}
