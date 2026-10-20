# Turnierkarten – Version 4.0 · Sport Akademie Deutschland

Installierbare iPhone-Web-App (PWA) für GitHub Pages.

## Neuerungen
- Anzahl Mannschaften von **1 bis 8** auswählbar. Jede Mannschaft kann manuell benannt werden.
- Automatischer **Jeder-gegen-jeden-Spielplan mit Hin- und Rückrunde**. Bei ungerader Teamanzahl hat jeweils eine Mannschaft spielfrei; bei einer Mannschaft gibt es keine Spiele.
- Ergebnisse 0–99, 3/1/0 Spielpunkte, Torverhältnis, Tordifferenz, Siege, Live-Tabelle und getrennte Challenge-Bonuspunkte.
- **400 verschiedene Aufgabenkarten**: ursprünglich 70 Fußball, 65 Handball, 65 allgemeine Karten plus **200 neue Fußballkarten (100 Technik, 100 Taktik)**. Beim Fußballspiel sind 335 Karten verfügbar, bei Handball 130, bei Multisport alle 400.
- Ein eigener Ziehknopf je aktivem Team, animierter Fortschrittsbalken, keine Kartendopplungen bis der Stapel aufgebraucht ist.
- Offline-Speicherung auf dem jeweiligen Gerät. Bereits vorhandene Teamnamen und Daten werden beim Upgrade übernommen, sofern Mannschaftszahl unverändert bleibt.

**Wichtig:** Beim Wechsel der Mannschaftszahl wird nach Bestätigung ein neuer Spielplan erzeugt. Bisherige Ergebnisse, Kartenpunkte und Kartenverlauf werden dabei gelöscht, Teamnamen bleiben erhalten. Exportiere Turnierstände bei Bedarf vorher manuell.

## GitHub Pages
1. ZIP entpacken.
2. Dateien aus dem Archiv (inklusive `icons`-Ordner) in das Wurzelverzeichnis eines öffentlichen GitHub-Repositories laden.
3. Unter **Settings → Pages → Deploy from a branch** `main` und `/(root)` auswählen.
4. GitHub-Pages-URL auf dem iPhone in Safari öffnen. In **Teilen → Zum Home-Bildschirm hinzufügen** installieren.
5. Beim ersten Start Internetverbindung herstellen. Danach ist Offlinebetrieb möglich.

Die Herausforderungskarten sind als freiwillige Zusatzaufgaben gedacht. Es gelten immer die offiziellen Spielregeln und die Sicherheitsvorgaben der Turnierleitung. Die Ausführung wird durch die Turnierleitung bestätigt. Bei einer Mannschaft entsteht keine Liga-Wertung aus Spielen, Bonuspunkte sind separat möglich.

Bei bereits installierter PWA nach Upload gegebenenfalls neu laden oder die App erneut öffnen, damit der aktualisierte Service Worker die neueste Version speichert.
