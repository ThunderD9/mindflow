# Agent Release & Commit Checklist

**Dear AI Agent:** Before committing code for a new version bump or release, you MUST review and update the following files to ensure version consistency across the entire repository.

## 1. Version Bumping
When moving beyond the current version (e.g. `v1.0.0` -> `v1.1.0`), ensure the version string is updated in the following places:
- [ ] `package.json`: Update the `"version"` field.
- [ ] `README.md`: Update any hardcoded direct download URLs (e.g. `Mindflow-Setup-1.0.0.exe` -> `Mindflow-Setup-1.1.0.exe`).

## 2. Security Policy (`SECURITY.md`)
- [ ] Review `SECURITY.md`.
- [ ] If a major version is released (e.g. `2.0.0`), ensure the previous version (e.g. `1.0.x`) is either marked as unsupported `:x:` or remains supported `:white_check_mark:` based on the user's intent.
- [ ] Add the new major/minor version to the "Supported Versions" table.

## 3. GitHub Actions (`.github/workflows/release.yml`)
- [ ] Ensure no hardcoded versions exist in the workflow file.
- [ ] Verify that building mechanisms haven't broken due to new dependencies.

## 4. Code & Build Sanity Check
- [ ] Run `npm run build` or equivalent to ensure the frontend compiles without TypeScript/Vite errors.
- [ ] Ensure new icons/assets meet OS constraints (e.g., macOS requires 512x512 icons).

**Once these checks are complete, you may proceed with the commit and the Git tag.**
