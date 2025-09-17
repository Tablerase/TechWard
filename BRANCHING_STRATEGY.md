# Branching Strategy

This document outlines the branching strategy for this repository, based on **Trunk-Based Development (TBD)**.

---

## Overview

- **One main branch** (`main`) is the source of truth.
- **Short-lived feature branches** for small, incremental changes.
- **Frequent merges** into `main` (at least daily).
- **Feature flags** to hide incomplete features in production.

---

## Branches

### 1. `main` Branch

- **Purpose**: Represents the current production state.
- **Rules**:
  - Always keep `main` in a deployable state.
  - Direct commits allowed for personal project (no PR required).
  - Use feature branches for experimental or complex changes.

### 2. Feature Branches

- **Purpose**: Develop new features, bug fixes, or improvements.
- **Naming**: `feature/your-feature-name`, `fix/bug-description`, or `improve/task-name`.
- **Rules**:
  - Short-lived (hours/days, not weeks).
  - Small, incremental changes.
  - Update with `main` daily to avoid conflicts.
  - Merge directly into `main` after testing.

### 3. Hotfix Branches

- **Purpose**: Critical production fixes.
- **Naming**: `hotfix/description`.
- **Rules**:
  - Created from `main`.
  - Merged immediately after testing.
  - Deleted post-merge.

---

## Workflow

### Starting a Feature

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Merging a Feature

1. Update your branch:
   ```bash
   git pull origin main
   ```
2. Merge directly into `main`:
   ```bash
   git checkout main
   git merge --no-ff feature/your-feature-name
   ```
3. Push changes and delete the feature branch:
   ```bash
   git push origin main
   git branch -d feature/your-feature-name
   # If remote branch need to be rm
   git push origin --delete feature/your-feature-name
   ```

<!-- --- -->

<!-- ## Pull Request (PR) Guidelines

- **Title**: Clear and descriptive.
- **Description**: Explain the purpose, include screenshots, and reference issues.
- **Review**: Address all comments before merging.
- **Tests**: Ensure all tests pass and add new tests for new features. -->

---

## Feature Flags

- Use feature flags for incomplete features.
- Remove flags once the feature is fully released.

---

## Release Process

- Releases are automated via CI/CD when changes are merged into `main`.
- Use semantic versioning (e.g., `v1.0.0`).
- Tag releases:
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0"
  git push origin v1.0.0
  ```

---

## Resources

- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Semantic Versioning](https://semver.org/)
