# Security Policy

`Kypros Path` treats security reports as private by default.

## Reporting a Vulnerability

- Do not open a public GitHub issue for a suspected vulnerability.
- Prefer GitHub Security Advisories / private vulnerability reporting for this repository when available.
- If private reporting is not available, contact the repository owner privately via the GitHub account that maintains this repository.

Please include:

- a short description of the issue;
- affected files, routes, or workflows;
- reproduction steps or proof of concept;
- impact assessment if known.

## Scope

This repository especially treats the following as security-sensitive:

- `.github/workflows/**` and other release automation;
- future auth, session, upload, or AI-facing flows;
- secrets, tokens, credentials, and local environment handling;
- dependency and supply-chain risks.

## Disclosure Expectations

- Please allow reasonable time to validate and remediate the issue before public disclosure.
- If the report is confirmed, the fix will be coordinated before wider publication.

## Notes

- This policy does not create a bug bounty program.
- For privacy-sensitive product questions, also review the release and privacy guidance in `.config/app-docs/product/requirements/release/`.
