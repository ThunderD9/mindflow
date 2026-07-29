# Security Policy

## Supported Versions

Mindflow OS is currently in active development. We recommend always running the latest version to ensure you have the most up-to-date security patches and features.

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :x:                |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Security is a top priority for Mindflow OS, especially since the application handles API keys and personal journal entries. 

If you discover a security vulnerability, please **DO NOT** open a public GitHub issue. Instead, please report it privately to ensure we can patch it before it becomes publicly known.

**How to report:**
Please open a **Private Security Advisory** through GitHub by going to the "Security" tab of this repository and clicking "Report a vulnerability". 

We will acknowledge your report within 48 hours and work with you to understand and resolve the issue quickly.

## Threat Model & Scope
Mindflow OS is a **local-first** application. 
- All diary entries, tasks, and settings are stored locally on your machine.
- We do not host a backend database or telemetry servers.
- API Keys (such as your Google Gemini key) are stored entirely on your local machine and are only transmitted directly to Google's official API endpoints.

Vulnerabilities that require physical access to a user's unlocked device are generally considered outside the scope of our threat model, but we welcome all reports that improve the security posture of the application.
