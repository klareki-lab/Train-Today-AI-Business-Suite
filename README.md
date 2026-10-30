# Train Today — AI Business Suite

**A collaborative WBS Coding School project led through integration by Sergii Tytov (Klare KI), with application components and extensions contributed by Juri Poljanzew.** Train Today AI Business Suite brings **Train Today Onboard**, **Onboarding Coordinator**, and **CRM / Vertrieb & Service** into one locally deployable business platform. Sergii coordinated the solution architecture, independent codebase integration, Docker/PostgreSQL deployment, security hardening, testing, and release acceptance using Codex and Claude Code.

> **Status — Locally deployed and independently reviewed (October 2026).** The integrated suite runs locally with three restored PostgreSQL databases, role-based Portal and CRM access, a Coordinator, Mailpit, and 14 imported n8n workflows. Independent audits verified the infrastructure, data, authentication, and key integration paths; the local security remediation passed follow-up review with documented conditions. Workflows and external AI services are intentionally disabled in the portfolio demo. A full AI-driven onboarding run and production deployment are outside the verified scope.

## What is included?

| Component | Location | Capabilities |
| --- | --- | --- |
| Employee / HR portal | [`onboard/`](onboard/) | Employee registration, role-based login, onboarding tasks, personal access, company rules, team chat, leadership views |
| Onboarding coordinator | [`coordinator/`](coordinator/) | General + Marketing checklists, owners and due dates, evidence, approvals, task actions, persistent history, n8n MCP integration |
| CRM | [`crm/`](crm/) | Customers, leads, projects, sales and service, tasks, times, forecasts, audit, read-only project AI assistance |
| n8n exports | [`workflow-exports/`](workflow-exports/) and [`crm/workflows/`](crm/workflows/) | 5 onboarding/coordinator and 9 CRM exports, **inactive by default** |
| Local stack | [`compose.yaml`](compose.yaml), [`local-suite.py`](local-suite.py) | Isolated Docker Compose, PostgreSQL instances, local mail capture |

## Onboarding learning objectives

The coordinator maps the Train Today **General Onboarding** and **Marketing Onboarding** checklists into explicit tasks, using four human-oversight classes: **AUTO**, **HITL** (human approval), **HOTL** (human oversight) and **HUMAN**. See [task catalog](coordinator/catalog.mjs) for task definitions and assumptions. AI prepares plans and greetings; human staff authorizes access and important HR decisions.

## Architecture

```text
Browser / React portal --> HR API --> HR PostgreSQL
                 |             |
                 |             +-- authenticated webhook --> local n8n --> callback
                 v
      Coordinator API --> Coordinator PostgreSQL
                 |
                 +-- MCP --> local n8n (on explicit setup)
                 |
                 +-- local Mailpit
                 |
           leadership bridge
                 |
              CRM API --> CRM PostgreSQL
                 |
                 +-- optional AI provider / n8n
```

The three application databases are separate. Their historical dumps are not database migrations. **Never restore a handover dump on top of an existing production database.**

## Local setup (code-only)

Prerequisites: Git, Docker Engine/Desktop with Compose v2, Python 3 and local free ports.

```bash
git clone https://github.com/klareki-lab/Train-Today-AI-Business-Suite.git
cd Train-Today-AI-Business-Suite
python3 local-suite.py configure
```

For an authorized restored demonstration, obtain the historical database archive and its password **separately**; extract it outside this repository to a private directory and then use:

```bash
python3 local-suite.py restore --data-dir "/private/path/to/Train-Today-Daten"
python3 local-suite.py up
python3 local-suite.py status
```

The supplied restore utility only accepts a new, empty database environment. Without the archive, consult the component setup guides rather than assuming an empty local instance has the historical users and projects.

Default URLs in the original handover: portal `http://localhost:5173`, CRM `http://localhost:3080`, Mailpit `http://localhost:8025`; use `--port-offset` at configuration time when needed. **Do not use `down -v`** if you intend to keep local data.

Provider API keys, passwords, database dumps and local `.env` are never to be committed. The old archive has been intentionally excluded from this repository. Keep secrets in private local files and local n8n credentials.

## Portfolio Demo

This local demonstration brings together an HR and employee portal, onboarding task coordination and a CRM for customer and project management. It uses React and TypeScript, Node.js, PostgreSQL, Docker Compose, n8n and Mailpit. Role-based views, approval-oriented task plans and CRM dashboards can be explored with local accounts; email is captured locally. AI providers, MCP and n8n workflows remain disabled in the demonstration and are not presented as a live AI execution.

After the separately supplied historical data has been restored into new, isolated suite volumes as described above, start the existing installation with `python3 local-suite.py up`. To start its separate automation service, run `docker compose --env-file .env -f compose.yaml --profile automation up -d n8n`. The original default URLs are Portal `http://localhost:5173`, CRM `http://localhost:3080`, Mailpit `http://localhost:8025` and n8n `http://localhost:5681`; a configured port offset changes these addresses. This owner's local installation uses `http://localhost:35173`, `http://localhost:33080`, `http://localhost:38025` and `http://localhost:35681`, respectively. Credentials and the data archive are stored privately and are not part of the repository.

Sergii's portfolio work covers the local integration, deployment, security remediation and demonstration preparation of this suite. The original component authors and project provenance remain credited below and in [PROVENANCE.md](PROVENANCE.md). A short German narration is available in [PORTFOLIO-DEMO-DE.md](PORTFOLIO-DEMO-DE.md). Review and anonymize any historical data before recording or publishing footage.

## Guides and evidence

- [Suite configuration, credentials and workflow activation](CONFIGURATION.md)
- [Architecture, API/database compatibility, integration limits](INTEGRATION-READINESS.md)
- [Reported handover tests](TEST_REPORT.md)
- [Exact inventory of 14 workflows](WORKFLOW-INVENTORY.json)
- [Original handover overview](README-HANDOVER.md)
- [Source provenance](PROVENANCE.md)

**Handover test report:** 62/62 component tests, 21/21 restore/API checks, 3/3 browser checks; 14 workflow imports, none activated. New real-provider calls, complete AI-to-HR approval and all CRM write operations remain unverified in that report.

## Collaboration

This repository is intended for the WBS cohort to inspect architecture, run independent local demos and review Pull Requests. Make changes in feature branches; review migrations, workflow credentials and integration effects before merging. No existing WBS Trade Fair or Employee Onboarding production environment is modified by this source import.

## Credits

- **Sergii Tytov — Klare KI:** solution architecture and integration leadership; consolidation into the independent suite; local Docker and three-database deployment; n8n inventory and configuration; security remediation, independent QA coordination, release management, and portfolio demonstration.
- **Juri Poljanzew:** Train Today Onboard, Coordinator and CRM application contributions, extensions, and original suite handover.
- **Klare KI / WBS project team:** initial Employee Onboarding foundation and collaborative educational development.

See [provenance](PROVENANCE.md) for the original source and revision. Contributions are attributed by responsibility; this project does not claim that one person wrote the entire codebase.
