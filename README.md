# 🏥 The Tech Ward – A Fullstack Portfolio Project

## 📌 Overview

This project is a portfolio showcase that uses the analogy of a hospital ward to demonstrate my skills in:

- DevOps & Cloud Infrastructure (Kubernetes, ArgoCD, GitOps, CI/CD)

- Backend Development (Django, Express, APIs, GitHub integration)

- Frontend Development (Interactive ward UI, SVG/Canvas, React)

- Monitoring & Observability (Prometheus, Grafana, Alertmanager)

- Mobile Development (future) (React Native for alerts)

Each room in the hospital represents a technical skill or service, and each patient problem represents a real-world engineering challenge to solve.

## 📌 Project Planning

For this project i will try to follows/learn an agile-style workflow using GitHub Projects.

- Issues represent tasks & features.
- Project board tracks To Do → In Progress → Done.
- Milestones group iterations (MVP, Monitoring, Alerts...).

👉 You can follow the progress here:

- Project Board: **https://github.com/users/Tablerase/projects/4/**
- Milestones: **https://github.com/Tablerase/Portfolio/milestones**

### 🏥 Iteration 1 – MVP: Patient Room

- Focus: Backend + DevOps loop.
- Skill Demo: Kubernetes, ArgoCD, GitOps, API, CI/CD basics.
- Deliverable: Patient Room shows a drift problem, resolved via commit.

Takeaway: I can set up a full backend+infra pipeline, even if simple.

### 🔄 Evolution Plan (Subject to further changes)

#### 🏥 Iteration 2 – Care Station (Monitoring & Metrics)

- New Room: Care Station = Monitoring hub.
- Skill Demo: Prometheus + Grafana integration.
- Problem Example: Patient heartbeat too high (pod CPU > 90%) or maybe a simulated generation of patient data sent to Prometheus via exporter.
- Resolution: Caregiver scales pods via backend → cluster healthy again.

Takeaway: I know observability and how to connect monitoring → problem resolution.

#### 🏥 Iteration 3 – Alerts Room (Notifications)

- New Room: Alerts = Incident handling.
- Skill Demo: Alertmanager, webhook/Slack/email integration.
- Problem Example: Patient fever alert = service down.
- Resolution: Backend auto-triggers an action or sends caregiver a notification.

Takeaway: I can handle incident management + automation.

#### 🏥 Iteration 4 – Supply Room (Data & Persistence)

- New Room: Supply = Database.
- Skill Demo: PostgreSQL, backup/restore, persistence in K8s.
- Problem Example: Missing supply → backup failed.
- Resolution: Caregiver triggers backup job via backend.

Takeaway: I know stateful workloads + data resilience.

#### 🏥 Iteration 5 – SickBay (Mobile App)

- New Room: SickBay = Mobile interaction.
- Skill Demo: React Native app consuming backend API.
- Problem Example: Mobile caregiver scans QR code → subscribes to patient vitals → receives push alert.

Takeaway: I can bridge backend + mobile ecosystems.

#### 🏥 Iteration 6 – Advanced Floors (Scaling & Multi-User) - (To Learn/Experiment with)

- New Feature: Multi-floor ward.
- Skill Demo: HPA (autoscaling), role-based access (lock problems).
- Problem Example: Too many patients on one floor = scale out pods.
- Resolution: Caregiver moves to another floor (new namespace/cluster).

Takeaway: I can design for scalability and team collaboration.
