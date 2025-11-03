import * as k8s from '@kubernetes/client-node'

function getKubeConfig() {
  const kc = new k8s.KubeConfig();

  const isInCluster =
    process.env.KUBERNETES_SERVICE_HOST &&
    process.env.KUBERNETES_SERVICE_PORT &&
    process.env.KUBERNETES_SERVICE_HOST != undefined;

  if (isInCluster) {
    kc.loadFromCluster();
    console.log("KC running in-cluster")
  } else {
    kc.loadFromDefault();
    console.log("KC running from local")
  }

  return kc
}

// TODO: in prod add RBAC kubernetes to backend app
/**
 * 
RBAC for backend:

apiVersion: v1
kind: ServiceAccount
metadata:
  name: backend-sa
  namespace: backend

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: backend-read
  namespace: demo
rules:
  - apiGroups: ["", "apps"]
    resources: ["pods", "deployments"]
    verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: backend-read-binding
  namespace: demo
subjects:
  - kind: ServiceAccount
    name: backend-sa
    namespace: backend
roleRef:
  kind: Role
  name: backend-read
  apiGroup: rbac.authorization.k8s.io

Add ServiceAccount user (with above role) to backend app

backend deployment file
...
spec:
  serviceAccountName: backend-sa
 */

const kc = getKubeConfig();
// Doc: https://kubernetes-client.github.io/javascript/classes/AppsV1Api.html
const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);

export async function getDeploymentImage(namespace: string, deploymentName: string) {
  const res = await appsV1Api.readNamespacedDeployment({ name: deploymentName, namespace: namespace });
  const image = res.spec?.template?.spec?.containers?.[0]?.image;
  return image;
}

