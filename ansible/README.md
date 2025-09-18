# Ansible for k3d (best-practice layout)

This directory provides a structured Ansible setup to prepare a local Linux host, install k3d, and create a local Kubernetes cluster.

## Layout

- `ansible.cfg` — Defaults for inventory and roles path
- `inventories/local/` — Local environment inventory and variables
- `roles/` — Roles split by concern
  - `common` — Base packages and user setup
  - `docker` — Docker engine installation and service
  - `kubernetes` — kubectl install via pkgs.k8s.io
  - `k3d` — Installs k3d and creates a cluster
- `playbooks/` — Entry-point playbooks
  - `site.yml` — Run common, docker, and kubernetes
  - `k3d.yml` — Install k3d and create a cluster

## Prerequisites

- Linux host (tested on Ubuntu)
- Ansible installed locally
- Docker will be installed by the `docker` role

Optional: create and activate a virtual environment and install dependencies from `requirements.txt`.

## Quick start

Run base setup (common + docker + kubernetes):

```sh
ansible-playbook playbooks/site.yml -K
```

Install k3d and create the cluster:

```sh
ansible-playbook playbooks/k3d.yml -K
```

## Variables

Defaults live in role `defaults/main.yml` and in `inventories/local/group_vars/all.yml`.
Common variables:

- `project_user` — local developer user (default: `developer`)
- `k3d_version` — k3d release tag
- `k3d_cluster_name` — cluster name
- `k3d_servers` — number of server nodes

Override with `-e` or by editing the appropriate `group_vars`.

## References

- Ansible best practices: https://spacelift.io/blog/ansible-best-practices
