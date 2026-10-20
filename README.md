# Turnierkarten – Version 2.0 (8 Teams)

**Neu:** Acht gleichzeitig verwaltbare Mannschaften, acht frei änderbare Teamnamen und eigene Ziehbuttons, Punktestände und offene Aufgaben pro Mannschaft. Gespeicherte Daten der Zwei-Team-Version werden lokal übernommen.

# Turnierkarten – Sport Akademie Deutschland

Eine kostenlose, installierbare **Progressive Web App (PWA)** für Fußball-, Handball- und Multisportturniere. Keine Programmierung, kein Server und kein Apple-Developer-Konto nötig.

## Funktionen
- **200 einzigartige Challenge-Karten** (70 Fußball, 65 Handball, 65 sportübergreifend).
- Sportfilter: Fußball (135 passende Karten), Handball (130 passende Karten), Multisport (alle 200).
- Team 1 und Team 2 ziehen per eigenem Knopf jeweils eine zufällige Karte.
- Animierte Auswahl mit **Fortschrittsbalken und Prozentanzeige**.
- Karte mit Aufgabe, Wertung und individuell vergebenen **3–12 Bonuspunkten**.
- Turnierleitung bestätigt Erfüllung; nur dann werden Punkte addiert.
- Kartenverlauf, Bonuspunktestand und gezogene Karten werden auf diesem Gerät gespeichert.
- Gezogene Karten wiederholen sich innerhalb des aktuellen Sportstapels erst, nachdem alle Karten verwendet wurden.
- Installation auf iPhone-Homebildschirm, danach offline nutzbar.

## In GitHub hochladen (ohne Programmierkenntnisse)
1. Bei https://github.com anmelden.
2. Oben rechts **+ → New repository** wählen; z. B. `turnierkarten`.
3. Repository auf **Public** setzen und **Create repository** klicken.
4. **Add file → Upload files** anklicken.
5. **Alle Dateien UND den Ordner `icons` aus dem ZIP** in die Uploadfläche ziehen (nicht nur die ZIP-Datei hochladen). Alternativ Ordner per Git aufspielen.
6. Unten **Commit changes** bestätigen.
7. Unter **Settings → Pages → Build and deployment** als Quelle **Deploy from a branch**, Branch **main**, Ordner **/(root)** auswählen und **Save** drücken.
8. Einige Minuten warten. Danach sollte die Seite unter `https://DEIN-BENUTZERNAME.github.io/turnierkarten/` erreichbar sein (bei abweichendem Repositorynamen URL entsprechend ändern).

## Auf dem iPhone installieren
1. Die veröffentlichte GitHub-Pages-URL mit **Safari** auf dem iPhone öffnen.
2. Auf **Teilen** tippen.
3. **Zum Home-Bildschirm** bzw. **Zum Home-Bildschirm hinzufügen** auswählen.
4. **Hinzufügen** wählen. Auf dem Homebildschirm steht nun die Turnierkarten-App.
5. Beim **ersten Start** einmal online öffnen; danach sind die Karten offline verfügbar.

**Wichtig:** Diese Variante ist eine **PWA**, keine App-Store-IPA. Die Installation erfolgt ohne App Store direkt aus Safari. Änderungen im GitHub-Repository aktualisieren die Website; bei Caching kann ein erneutes Öffnen / Neuladen nötig sein.

## Verwendung
- Vor dem Spiel Sportart auswählen und die Mannschaften benennen.
- Beide Teams ziehen nacheinander oder unabhängig voneinander ihre Karten.
- Nach der Begegnung prüft die Turnierleitung die Aufgaben. Mit **Aufgabe erfüllt** werden die Bonuspunkte vergeben; mit **Nicht erfüllt** werden keine Punkte vergeben.
- Die angezeigten Zahlen sind **Bonuspunkte**, keine Tore/Treffer und keine offizielle Liga-/Tabellenwertung.

## Hinweise
- Es gibt **keinen gemeinsamen Mehrgeräte-Spielstand**. Der Stand wird lokal im Browser/der installierten App gespeichert. Verwende ein zentrales Gerät für die Turnierleitung.
- Nicht jede Aufgabe passt zu jeder Spielzeit, Altersgruppe, Spielform oder Turnierordnung. Unpassende Aufgaben ohne Punkte ablegen und im Einzelfall erneut ziehen.
- Spielregeln, Sicherheit und Fairplay haben Vorrang.
- App und Karten können in `index.html`, `style.css`, `app.js` und `cards.json` angepasst werden.
- Für ein GitHub-Pages-Unterverzeichnis sind alle Pfade relativ gehalten.
- Repository benötigt kein Backend und erhebt/sendet keine Mannschaftsnamen an einen Dienst (GitHub Pages liefert lediglich die statischen Dateien).

## Dateien
- `index.html`: Oberfläche
- `style.css`: Smartphone-Design
- `app.js`: Ziehen, Animation, Bonuspunkte, Speicher
- `cards.json`: alle 200 Karten
- `manifest.webmanifest`: Installationsinformationen
- `sw.js`: Offline-Cache
- `icons/`: App-Symbole in drei Größen

Version 1.0 · Sport Akademie Deutschland


## Version 3.0: Liga-Turniermodus

- 8 Mannschaften, frei benennbar.
- Jeder gegen jeden mit Hin- und Rückrunde: 14 Spieltage mit 4 Spielen, insgesamt 56 Spiele.
- Zwei Torzahlen pro Spiel erfassen und mit „Speichern“ bestätigen; Eingaben können korrigiert oder gelöscht werden.
- Automatische Tabelle: Sp, S, U, N, Tore, Tordifferenz, Ligapunkte, Kartenbonuspunkte, Gesamtpunkte.
- 3 Punkte pro Sieg, 1 pro Unentschieden, 0 pro Niederlage.
- Kartenbonuspunkte werden zum Gesamtpunktestand hinzuaddiert. Sortierung: Gesamtpunkte, Tordifferenz, Tore, Siege.
- Spielplan neu erstellen und Spielergebnisse separat zurücksetzen.
- Offline und lokal im Browser gespeichert, kein geräteübergreifender Abgleich.
