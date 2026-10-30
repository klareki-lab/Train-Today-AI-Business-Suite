# Local demo accounts

The local installation has separate accounts for the Portal, CRM and n8n. It includes a personal demo account for the project owner, historical test accounts and a separate local n8n owner. The Portal supports HR administration, employee, system administrator and leadership access; the CRM supports manager and advisor roles. Permissions depend on the individual account.

| Service | Local address |
| --- | --- |
| Portal | http://localhost:35173 |
| CRM | http://localhost:33080 |
| n8n | http://localhost:35681 |

The owner's private file `/Users/admin/.config/klare-ki/train-today-suite/TRAIN-TODAY-ACCOUNTS.txt` contains the account names, exact login identifiers, passwords, confirmed roles and verification status. It is stored outside the repository with owner-only permissions. Open it locally to obtain the appropriate credentials; do not copy its contents into Git, screenshots, issues or public material. Credentials for the historical n8n instance are labeled separately and are not the current local owner account.

These addresses apply to the configured local port offset. The historical demonstration data may contain personal or customer information; review and redact screens before publishing video. MCP, external AI services and n8n workflows remain disabled for the local demo.
