# Målräknare för ungdomsmatcher

En mobilvänlig React-app för personen vid sidan av planen. Vyn prioriterar lagnamn, poäng och målknappar utan dekorativa märken eller extra rubriktexter. Två lag, stora målsiffror och tydliga knappar för att lägga till eller ta bort ett mål. Ingen koppling till arenans resultattavla.

## Kör lokalt

Node.js 24 rekommenderas (minst 22.12), med npm.

```sh
npm ci
npm run dev
```

Öppna adressen som Vite visar, normalt `http://localhost:5173/matchraknare/`.
För att prova på telefonen i samma nätverk: `npm run dev -- --host 0.0.0.0`, och öppna datorns lokala IP-adress på port 5173 med samma sökväg.

```sh
npm run lint
npm test
npm run build
npm run preview
```

Bygget hamnar i `dist`. Preview serverar produktionsbygget lokalt.

## Användning och lagring

- Skriv direkt i lagnamnen (högst 40 tecken).
- **Lägg till mål** ökar rätt lags mål. **Ta bort mål** rättar ett feltryck och är avstängd vid noll.
- **Ny match** öppnar en bekräftelsedialog. **Avbryt** eller Escape behåller matchen. **Nollställ och starta** sätter båda målantalen till noll och behåller lagnamnen.
- Namn och mål sparas automatiskt med `localStorage`. Omladdning och stängd flik behåller normalt matchen.

**Uppgifterna finns bara i den aktuella webbläsaren på den aktuella enheten. De synkroniseras inte mellan telefoner.** Rensad webbplatsdata eller avslutad privat surfning kan radera matchen. Ingen inloggning, server eller databas används. Om lagring blockeras eller är full visas en varning; appen kan fortfarande användas under den öppna sessionen. Saknade data ger en ny match. Skadade eller ogiltiga data ersätts med en ny match och en varning visas. Endast en aktuell match lagras; ingen historik eller samordning mellan flera samtidigt öppna flikar ingår.

## Repository och GitHub Pages

GitHub-repositoryt är [OscarAlpstig/matchraknare](https://github.com/OscarAlpstig/matchraknare). Vites `base` är **`/matchraknare/`**, efter repositoryts faktiska namn. Den lokala arbetsmappen heter `match_raknare`.

Koden innehåller ett arbetsflöde som automatiskt försöker publicera vid push till `main`. GitHub Pages-inställningarna ändras inte av projektet. För att aktivera webbplatsen när publicering har godkänts:

1. Öppna repositoryt `OscarAlpstig/matchraknare`.
2. Välj **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Kör arbetsflödet manuellt från Actions, eller pusha till `main`. Arbetsflödet installerar med `npm ci`, kör lint och tester, bygger och publicerar `dist` med Pages Actions.
4. Adressen blir normalt `https://oscaralpstig.github.io/matchraknare/`.

Om GitHub-repositoryt får ett annat namn måste `base` i `vite.config.ts` uppdateras till det faktiska namnet före publicering. Pages måste vara tillgängligt för kontot/repositoryts synlighet.

Bygg- och publiceringsmönstret är hämtat från [Huntingseasons package.json](https://github.com/OscarAlpstig/huntingseasons/blob/main/package.json), [Vite-konfiguration](https://github.com/OscarAlpstig/huntingseasons/blob/main/vite.config.ts) och [Pages-arbetsflöde](https://github.com/OscarAlpstig/huntingseasons/blob/main/.github/workflows/deploy.yml). Appen använder inga kartor, data, routing eller andra funktioner därifrån.

## Struktur och vidareutveckling

- `src/match.ts`: versionsmärkt datamodell, validering och lagring.
- `src/TeamCard.tsx`: återanvändbar lagvy.
- `src/App.tsx`: matchvy och bekräftelse med webbläsarens inbyggda modala dialog.
- `src/styles.css`: responsiv utformning utan externa typsnitt eller bilder.
- `src/App.test.tsx`: mål, rättning, återläsning, bekräftelse, ogiltiga data, lagringsfel och tangentbord.

Semantiska knappar, synlig tangentbordsfokus, namngivna inmatningar och lagregioner samt en live-region för måländringar ger stöd för tangentbord och skärmläsare. Native `dialog` sköter fokuslåsning, Escape och återgång av fokus i moderna webbläsare. Automatester använder en minimal dialogshim; verklig fokuslåsning och skärmläsarupplevelse behöver också verifieras manuellt på måltelefonerna.

Nästa möjliga steg är manifest, appikoner och service worker för installation och offline-start. De ingår inte i denna version. React-vyn, lagringen och presentationen är separerade så att det kan läggas till utan server eller ombyggd matchlogik. Publicering och GitHub Pages-inställningar återstår tills ägaren uttryckligen ber om det.

## Verifiering av första versionen

`npm run build`, `npm run lint` och samtliga nio tester har passerat. Mobilvyn har också kontrollerats i webbläsare, inklusive måländring, sparad ställning efter omladdning samt Escape och återställt fokus från bekräftelsedialogen. Manuell kontroll på fysiska telefoner och med skärmläsare återstår.

`npm audit` rapporterar sju måttliga poster i utvecklingsberoendena, alla kopplade till `minimatch` via TypeScript ESLint. Kompatibel `npm audit fix` har körts, men tar inte bort dessa poster. De ingår inte i produktionspaketet. En separat uppgradering av lintverktygen behöver utvärderas; ingen tvingad versionsändring har gjorts.
