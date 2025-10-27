# How to set it up

<img src="https://argo-cd.readthedocs.io/en/stable/assets/logo.png" title="ArgoCD Logo" alt="ArgoCD Logo" align="right" width="200" />

- Create a dedicated GitHub repo

- Add the Kubernetes manifests
  - Deployment, Service, ConfigMap, etc.

- Generate a GitHub token
  - Use separate github account (not main) to avoid security issues.
  - Go to Settings → Developer settings → Personal access tokens.
    - https://github.com/settings/tokens
  - Generate token.
  - Grant repo:public_repo (for public) or repo (for private) access.
  - Store it securely (e.g., in environment variable in backend).

## Backend setup

Use the token for authentication when committing and pushing changes automatically.

## Architecture Diagram

```mermaid
---
title: ArgoCD GitOps Workflow
---
flowchart TD;
  subgraph k3d["Cluster (tech-ward)"]
    subgraph nsArgo["Namespace: argocd"]
      direction LR
      argo_pods["ArgoCD Pods"]
      argo_svc["ArgoCD Service"]
    end
    subgraph nsDev["Namespace: argo-demo"]
      direction LR
      app_deployment@{ shape: proc, label: "Deployment (demo app)" }
      app_svc@{ shape: proc, label: "Service (demo app)" }
      app_pod@{ shape: proc, label: "Pod (demo app)" }
      app_ingress@{ shape: proc, label: "Ingress (demo app)" }
    end
  end

  subgraph client["User Client"]
    updateApp@{ shape: hexagon, label: "Update App button<br>(in Tech Ward)" }
  end

  updateApp clientup@-->|"Send API Request"| backend
  subgraph backend["Backend Server"]
    gitUpdate@{ shape: cylinder, label: "Git Client<br>(using token)" }
  end

  backend bcommit@-->|"Commit & Push <br>predefined changes"| git_repo
  backend btrigger@-->|"Trigger ArgoCD Sync API"| argo_svc

  subgraph "External"
    subgraph git_repo["Git Repo"]
      manifestD@{shape: doc, label: "deployment.yaml"}
      manifestS@{shape: doc, label: "service.yaml"}
      manifestI@{shape: doc, label: "ingress.yaml"}
    end
  end

  app_deployment appdeppod@--> app_pod

  git_repo gitargo@-->|"Sync<br>Watches for changes"|argo_pods
  argo_pods argodep@-->|"Applies manifests"|app_deployment
  argo_pods argosvc@-->|"Applies manifests"|app_svc
  argo_pods argoin@-->|"Applies manifests"|app_ingress

  classDef k8s fill: #326ce5,stroke: #fff,stroke-width:4px,color:#fff;
  classDef cluster fill: #fff,stroke: #bbb,stroke-width:2px,color:#326ce5;
  classDef external fill: #99dfff9f,stroke: #333,stroke-width:2px, color:#333;
  classDef kub-anim stroke-dasharray: 5,5, stroke-dashoffset: 300, stroke-width: 2, stroke: #99dfffc7, animation: dash 25s linear infinite;
  classDef git-anim stroke-dasharray: 5,5, stroke-dashoffset: 300, stroke-width: 2, stroke: #e0b25cff, animation: dash 25s linear infinite;
  classDef client-anim stroke-dasharray: 5,8, stroke-dashoffset: 200, stroke-width: 2, stroke: #5ce084ff, animation: dash 25s linear infinite;

  class clientup client-anim;
  class argo_pods,argo_svc,app_deployment,app_pod,app_svc,app_ingress k8s;
  class k3d,nsArgo,nsDev cluster;
  class git_repo external;
  class gitargo,bcommit,btrigger git-anim;
  class argodep,argosvc,argoin,appdeppod,appsvcpod kub-anim;
```
