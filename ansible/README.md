# Ansible for k3d

This folder contains a minimal Ansible setup to install k3d and create a single-server cluster on the local machine.

## Files

- `inventory.ini` — Local inventory using the local connection
- `k3d.yml` — Playbook to install k3d and create the cluster

## Prerequisites

- Docker installed and running
- Ansible installed

## Usage

From the repo root:

```sh
ansible-playbook -i ansible/inventory.ini ansible/k3d.yml -K
```

Variables you can override:

- `k3d_version` (default: `v5.7.4`)
- `k3d_cluster_name` (default: `tech-ward`)
- `k3d_servers` (default: `1`)

Example:

```sh
ansible-playbook -i ansible/inventory.ini ansible/k3d.yml -K \
  -e k3d_version=v5.7.4 -e k3d_cluster_name=mycluster -e k3d_servers=1
```
