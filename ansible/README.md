# Ansible for k3d

This directory provides a structured Ansible setup to prepare a local Linux host, install k3d, and create a local Kubernetes cluster.

## Installation

```bash
#!/bin/bash
# create py venv
python3 -m venv .venv

# activate venv
source .venv/bin/activate

# install Python Ansible deps
pip install -r requirements.txt

# install Ansible collections
ansible-galaxy collection install -r requirements.yml
```

## Layout

- `ansible.cfg` — Defaults for inventory and roles path
- `inventories/local/` — Local environment inventory and variables
- `roles/` — Roles split by concern
  - `common` — Base packages and user setup
  - `docker` — Docker engine installation and service
  - `kubernetes` — kubectl installation
  - `k3d` — Installs k3d and creates a cluster
- `playbooks/` — Entry-point playbooks
  - `setup.yml` — Run common, docker, and kubernetes
  - `k3d.yml` — Install k3d and create a cluster

## Quick start

Run base setup (common + docker + kubernetes):

```sh
# -K : ask for privilege escalation password if needed (sudo)
ansible-playbook playbooks/setup.yml -K
```

Install k3d and create the cluster:

```sh
ansible-playbook playbooks/k3d.yml -K
```

## Variables

Defaults live in role `defaults/main.yml` and in `inventories/local/group_vars/all.yml`.
Common variables:

- `project_user` — local linux user
  - least privilege principle and project isolation
  - allowing non-privileged kubectl and docker usage, created by the `common` role
  - used for file ownership and kubeconfig
- `k3d_version` — k3d release tag
- `k3d_cluster_name` — cluster name
- `k3d_servers` — number of server nodes

Override with `-e` or by editing the appropriate `group_vars`.

## References

- Ansible best practices: https://spacelift.io/blog/ansible-best-practices

- Ansible kubernetes: https://galaxy.ansible.com/ui/repo/published/kubernetes/core/docs/

<!-- - Ansible Kubernetes Guide FR: https://blog.stephane-robert.info/docs/conteneurs/orchestrateurs/outils/ansible-k8s/ -->
<!-- - ArgoCD Guide FR: https://une-tasse-de.cafe/blog/argocd/ -->

- ArgoCD : https://argo-cd.readthedocs.io/en/stable/getting_started/

- Kubernetes Schemas: https://github.com/yannh/kubernetes-json-schema/tree/master
- Kubernetes Dashboard: https://github.com/kubernetes/dashboard
  - Kubernetes Dashboard Best Practices: https://spacelift.io/blog/kubernetes-dashboard
