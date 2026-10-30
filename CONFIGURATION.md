# Konfiguration und n8n

## Gemeinsame Installation

### Lokale Sicherheitsgrenzen (G3.1)

`MCP_ENABLED` und `AI_ENABLED` stehen standardmäßig auf `0`. Bei deaktivierter CRM-KI oder fehlendem Schlüssel antworten KI-Endpunkte mit HTTP 503, bevor eine Provider-Verbindung aufgebaut wird. Die Datenbank- und normalen CRM-Endpunkte bleiben davon unabhängig. Schlüssel gehören ausschließlich in die private lokale Konfiguration, niemals in Browser-Code oder Git. Freigabe von KI benötigt eine gesonderte Entscheidung; der interne Docker-Netzverbund hat keinen allgemeinen Internetzugang und ist kein DNS- oder Hostname-Allowlist-Firewallersatz.

MCP bleibt ohne ausdrückliche Freigabe deaktiviert. Zum Vorbereiten nach Freigabe: in der separaten lokalen n8n-Instanz die importierten IDs `iR52oRyEoMWakIj9` und `V4fgFJOFdFtqYUjA` erneut prüfen, nur diese Workflows und notwendige MCP-Berechtigungen freigeben und ein neues lokales Token erstellen. Token ausschließlich in der privaten, mit 0600 geschützten `mcp.json` hinterlegen; die Platzhalterkonfiguration ist ungültig. Nur die interne Adresse `http://n8n:5678/mcp-server/http` ist erlaubt. Erst nach Prüfung der Workflow-Ziele und Credentials `MCP_ENABLED=1` in der privaten `.env` setzen und den Coordinator neu erstellen. Der Code erlaubt nur die beiden IDs und die benötigten Ausführungs-/Status-Tools. Keine Workflow-Aktivierung durch diese Vorbereitung. Zum Abschalten `MCP_ENABLED=0` setzen und den Coordinator neu erstellen; Workflows gegebenenfalls zusätzlich in n8n deaktivieren. Der Status `connected` wird ohne authentifizierten MCP-Test nicht behauptet.

Der Coordinator stellt keine eigene statische Oberfläche oder Host-Port mehr bereit. Der Portal-Reverse-Proxy erreicht seine authentifizierten API-Routen im internen Netzwerk. Ein lokaler Gateway verbindet ausschließlich feste Dienstziele mit den bestehenden Loopback-Ports und ist als einziger Container zusätzlich an einem ausgehenden Netzwerk angeschlossen. Das interne Netzwerk ersetzt keine unabhängige Firewall oder DNS-Allowlist; insbesondere hat der Gateway selbst einen ausgehenden Pfad. Dies bleibt ein Sicherheitsvorbehalt für eine spätere Freigabe.

`local-suite.py configure` erstellt ignorierte Dateien `.env` und `.private/mcp.json`. Geheimnisse nur dort bzw. in n8n-Credentials hinterlegen. Nach Änderungen an `.env`: `python local-suite.py up`. Nach Änderung an `coordinator/config.json` muss `onboarding-dashboard` neu gebaut werden.

| Variable | Zweck / Dienst | Erforderlich | Neue Zugangsdaten |
| --- | --- | --- | --- |
| `HR_DB_PASSWORD`, `COORDINATOR_DB_PASSWORD`, `CRM_DB_PASSWORD` | Besitzer der drei lokalen PostgreSQL-Datenbanken | Ja | Automatisch neu erzeugt |
| `CRM_APP_PASSWORD`, `CRM_AGENT_PASSWORD` | CRM-App und lesende Agentenrolle | Ja | Automatisch neu erzeugt |
| `CRM_INTERNAL_KEY` | Interne CRM-Aufrufe und signierter Datenbankkontext | Ja | Automatisch neu erzeugt |
| `LEADERSHIP_BRIDGE_KEY` | Authentifiziert Portal → CRM-Auswertung | Ja | Automatisch neu erzeugt; beide Dienste identisch |
| `INTERNAL_API_SECRET` | n8n-Ergebnisrückmeldung an HR-API | Für neue Verarbeitung | Automatisch erzeugt, in Header-Credential übernehmen |
| `DEPARTMENTS_API_SECRET` | Abteilungsverzeichnis für KI-Agenten | Für neue Verarbeitung | Automatisch erzeugt, in Header-Credential übernehmen |
| `N8N_ONBOARDING_WEBHOOK_SECRET` | HR-Backend → n8n-Eingang | Für neue Verarbeitung | Automatisch erzeugt, in Header-Credential übernehmen |
| `N8N_ENCRYPTION_KEY` | Verschlüsselung der neuen n8n-Instanz | Für n8n | Automatisch neu erzeugt; sichern |
| `HR_WEBHOOK_URL` | Neue HR-Aufnahmen an n8n weiterleiten | Für neue Verarbeitung | URL statt Geheimnis; zunächst leer |
| `SYSTEM_ADMIN_EMAIL` | Empfänger der Systemadmin-Mitteilung | Optional | Adresse setzen; Versand bleibt lokal in Mailpit |
| `LEADERSHIP_AI_KEY` | Projekt-Assistent der Leitung | Optional | Eigener API-Schlüssel erforderlich |
| `AI_API_KEY` | CRM-KI-Funktionen | Optional | Eigener API-Schlüssel erforderlich |
| `LEADERSHIP_AI_BASE_URL`, `AI_BASE_URL` | KI-Anbieteradresse | Bei Nutzung prüfen | Vorgabe Requesty; kompatibler Anbieter möglich |
| `LEADERSHIP_AI_MODEL`, `AI_MODEL` | Modellbezeichnung | Bei Nutzung prüfen | Vorgabe `openai/gpt-4.1-mini` |
| `WEB_PORT`, `API_PORT`, `COORDINATOR_PORT`, `CRM_PORT`, `N8N_PORT`, `MAILPIT_PORT` | Lokale Hostports | Ja | Automatisch gesetzt, keine Secrets |

Diese Konfiguration gilt für **lokales Testen**. Staging/Produktion brauchen eigene Secret-Verwaltung, HTTPS, Sicherungen und eine unabhängige Abnahme. Die Compose-Datei setzt `NODE_ENV=development` ausdrücklich für lokale HTTP-Anmeldung. `PORTAL_ORIGIN` wird daraus passend gesetzt. Produktionssicherheitsprüfungen im Backend bleiben erhalten.

## n8n separat starten und importieren

```shell
docker compose --env-file .env --profile automation up -d n8n
```

Im Browser den konfigurierten `N8N_PORT` öffnen, ein **neues n8n-Owner-Konto** einrichten und die JSON-Dateien aus `WORKFLOW-INVENTORY.json` importieren. Portal-/CRM-Zugänge sind keine n8n-Logins. Die Exporte enthalten keine Credential-Werte und sind inaktiv. **Import bedeutet nicht Aktivierung.**

Die fünf Onboarding-Exporte wurden direkt aus Juris laufenden lokalen Instanzen exportiert. Die neun CRM-Exporte stammen aus dem lokalen CRM-Quellordner; sie sind nicht als frisch exportierte aktive Workflows ausgewiesen. Für den CLI-Import wurden eindeutige CRM-IDs ergänzt. Nur in die neue Instanz importieren, damit keine gleichnamigen IDs einer bestehenden Installation überschrieben werden.

### 1. Mitarbeiteraufnahme

`workflow-exports/wbsOnboardingLocal.json` verarbeitet HR-Aufnahmen mit den drei KI-Agenten und meldet Ergebnisse an `http://api:3001/api/internal/onboarding/result`. Der Eingang ist `POST /webhook/wbs-onboarding`.

In n8n anlegen und den Nodes zuordnen:

- OpenAI-kompatibles Credential mit eigenem Schlüssel und passender Basis-URL. Die Namen im Export sind nur Zuordnungshinweise.
- „Onboarding Webhook Secret (Header Auth)“: Header `Authorization`, Wert `Bearer ` gefolgt vom Wert aus `N8N_ONBOARDING_WEBHOOK_SECRET`.
- „Internal API Secret (Header Auth)“: Header `Authorization`, Wert `Bearer ` gefolgt vom Wert aus `INTERNAL_API_SECRET`.
- „Departments API Secret (Header Auth)“: Header `Authorization`, Wert `Bearer ` gefolgt vom Wert aus `DEPARTMENTS_API_SECRET`.

Diese drei getrennten Credentials entsprechen `onboard/backend/src/integrations/n8n.ts`, `middleware/auth.ts` und `routes/internal.ts`. Nach Credential-Zuordnung zunächst den Connectivity-Workflow testen, danach den Aufnahme-Workflow ausdrücklich veröffentlichen/aktivieren. In `.env` setzen:

```dotenv
HR_WEBHOOK_URL=http://n8n:5678/webhook/wbs-onboarding
```

Der Chat-Assistent ist ein zusätzlicher Chat-Einstieg und nicht der Trigger des HR-Formulars. „Connectivity only“ prüft Schnittstellen, ersetzt aber keinen vollständigen Aufnahme-Durchlauf.

### 2. Onboarding-Aufgaben und HR-Entscheidung

Die Exporte `iR52oRyEoMWakIj9.json` und `V4fgFJOFdFtqYUjA.json` gehören zum Koordinator. Das Portal ruft dessen API auf; dieser startet die passenden n8n-Workflows über den n8n-MCP-Server. Interne Aufträge werden über `http://onboarding-dashboard:3010/internal/claim` abgeglichen.

Nach Import und Credential-Zuordnung beide Workflows ausdrücklich für die Instanz-MCP-Verwendung freigeben. Einen neuen MCP-Zugang in n8n erstellen und den Token in `.private/mcp.json` hinterlegen. Die interne URL ist `http://n8n:5678/mcp-server/http`. Wenn n8n beim Import neue IDs vergeben hat, `coordinator/config.json` für `prepare` und `decision` anpassen. Anschließend den Koordinator neu bauen. Einen vollständigen neuen Fall samt HR-Freigabe in der isolierten Instanz prüfen, bevor diese Abläufe im echten Betrieb genutzt werden.

### 3. CRM-Workflows

Alle neun Dateien liegen unter `crm/workflows/`. Die Kopie verwendet für interne HTTP-Aufrufe `http://crm:3080`, damit kein fremdes CRM auf dem Host angesprochen wird.

- 01–04: Capture, Verarbeitung, Status und E-Mail-Outbox des `trade_fair`-Kerns. Benötigen getrennte PostgreSQL-Credentials für `crm_capture`, `crm_worker`, `crm_status` sowie Webhook-Authentifizierung. Die Rollen werden beim Restore angelegt, erhalten aber absichtlich noch keine Login-Passwörter; diese separat setzen. Datenbankhost ist `crm-db`, Datenbank `crm`.
- 02 benötigt zusätzlich Tavily und einen OpenAI-kompatiblen Zugang.
- 04 verwendet Resend für **echten externen Versand**. Nicht aktivieren, solange dieser nicht ausdrücklich gewünscht und konfiguriert ist. Das lokale Mailpit wird von diesem unveränderten Kern-Workflow nicht automatisch verwendet.
- 05–07: Dispatch, Statusabgleich und Erinnerungen. Interner Header `X-CRM-Internal-Key`, Wert `CRM_INTERNAL_KEY`.
- 08–09: Lesender Assistent und Extraktion; persönliche CRM-Authentifizierung bleibt erforderlich.

In der Ausgangskonfiguration sind `CORE_BASE_URL` und `CORE_KEY` nicht gesetzt; dadurch wird kein Kern angesprochen. `CORE_MODE=disconnected` kennzeichnet diesen Zustand. Für die lokale Kern-Anbindung zusätzlich `CORE_BASE_URL=http://n8n:5678/webhook` und einen neuen `CORE_KEY` in der CRM-Service-Umgebung ergänzen. Den gleichen Key im Header-Credential `X-Trade-Fair-Key` der Capture-/Status-Webhooks hinterlegen und Rollenrechte prüfen. Keinen zweiten Worker für dieselbe Produktions-Outbox starten. Die historische CRM-Einzelinstallation wird durch dieses Paket nicht umkonfiguriert.
