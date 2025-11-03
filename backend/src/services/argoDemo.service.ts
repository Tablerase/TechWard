import simpleGit, { SimpleGit } from "simple-git";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { config } from "dotenv";

config(); // Loads env var

const GITHUB_BOT_USERNAME = process.env.GITHUB_BOT_USERNAME;
const GITHUB_BOT_PERSONAL_ACCESS_TOKEN =
  process.env.GITHUB_BOT_PERSONAL_ACCESS_TOKEN;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;

if (
  !GITHUB_BOT_PERSONAL_ACCESS_TOKEN ||
  !GITHUB_BOT_USERNAME ||
  !GITHUB_REPO_NAME ||
  !GITHUB_REPO_OWNER
) {
  throw new Error(
    "Missing required environment variables for Argo Demo in .env",
  );
}

const REPO_URL = `https://${GITHUB_BOT_USERNAME}:${GITHUB_BOT_PERSONAL_ACCESS_TOKEN}@github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}.git`;
const REPO_LOCAL_PATH = path.resolve("./tmp-repo");

export const allowedTags = new Set(["1.25.0", "1.26.0"]);

/**
 * Updates a container image tag in the Kubernetes deployment manifest.
 * @param newTag The new version tag to update to (must be allowed)
 */
export async function updateDeployment(
  newTag: string = "1.25.0",
): Promise<void> {
  if (!allowedTags.has(newTag)) {
    throw new Error(
      `Tag ${newTag} is not allowed. allowedTags are: ${[...allowedTags].join(",")}`,
    );
  }

  const git: SimpleGit = simpleGit();
  if (!fs.existsSync(REPO_LOCAL_PATH)) {
    console.log("Cloning argo app repository...");
    await git.clone(REPO_URL, REPO_LOCAL_PATH);
  } else {
    await git.cwd(REPO_LOCAL_PATH);
    await git.pull("origin", "main");
  }

  const deploymentFile = path.join(
    REPO_LOCAL_PATH,
    "manifests/deployment.yaml",
  );
  if (!fs.existsSync(deploymentFile)) {
    throw new Error("deployment.yaml not found in repository");
  }

  const doc = YAML.parseDocument(fs.readFileSync(deploymentFile, "utf8"));
  const containerPathInDoc = ["spec", "template", "spec", "containers", 0];
  if (!doc.hasIn(containerPathInDoc))
    throw new Error("No container found in deployment file");

  const imagePathInDoc = ["spec", "template", "spec", "containers", 0, "image"];
  if (!doc.hasIn(imagePathInDoc))
    throw new Error("No image found in deployment container");
  const image: any = doc.getIn(imagePathInDoc);
  const updatedImage = image.toString().replace(/:[^:]+$/, `:${newTag}`);
  doc.setIn(imagePathInDoc, updatedImage);

  const updatedYaml = doc.toString();
  fs.writeFileSync(deploymentFile, updatedYaml, "utf8");

  await git.cwd(REPO_LOCAL_PATH);
  await git.add(["manifests/deployment.yaml"]);
  await git.addConfig("user.name", GITHUB_BOT_USERNAME);
  await git.addConfig(
    "user.email",
    `${GITHUB_BOT_USERNAME}@users.noreply.github.com`,
  );
  await git.commit(`Update image tag to ${newTag}`);
  await git.push("origin", "main");

  console.log(`Deployment updated to tag: ${newTag}`);
}
