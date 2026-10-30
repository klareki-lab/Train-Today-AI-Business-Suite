# Train Today — AI Business Suite

An educational, locally deployable business suite developed for the WBS Coding School AI Agents & Automations project. This repository brings together Juri Poljanzew's **Train Today Onboard**, **Onboarding Coordinator**, and **CRM / Vertrieb & Service** in a single independent codebase.

> **Status — Integration candidate (30 October 2026).** The supplied local handover reports passing component and restore tests. A new end-to-end AI onboarding execution and production deployment have **not** been independently confirmed. Do not connect the suite to real-company services or activate workflows without reviewing their configuration.

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

Train Today Suite handover and extensions: **Juri Poljanzew**. Initial WBS Employee Onboarding foundation and integration: **Klare KI / WBS project team**. See [provenance](PROVENANCE.md) for the exact original source and revision.
