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
- **Ny match** öppnar en bekräftelsedialog. **Avbryt** eller Escape behåller matchen. **Nollställ och starta** sätter båda målantalen till noll, behåller hemmalagets namn och återställer bortalagets namn till **Bortalag**.
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

PWA-stödet ligger separat i `src/OfflineSupport.tsx` och `vite.config.ts`. Matchlogiken och den befintliga `localStorage`-nyckeln är oförändrade. Ändringen för offline-stöd är förberedd lokalt för granskning och har inte publicerats.

## Verifiering av första versionen

`npm run build`, `npm run lint` och samtliga nio tester har passerat. Mobilvyn har också kontrollerats i webbläsare, inklusive måländring, sparad ställning efter omladdning samt Escape och återställt fokus från bekräftelsedialogen. Manuell kontroll på fysiska telefoner och med skärmläsare återstår.

`npm audit` rapporterar sju måttliga poster i utvecklingsberoendena, alla kopplade till `minimatch` via TypeScript ESLint. Kompatibel `npm audit fix` har körts, men tar inte bort dessa poster. De ingår inte i produktionspaketet. En separat uppgradering av lintverktygen behöver utvärderas; ingen tvingad versionsändring har gjorts.

## Kakor och lokal lagring

Längst ned i appen finns utfällbar information om lagringen. Appen använder `localStorage` för att behålla lagnamn och mål vid omladdning och när fliken öppnas igen, samt för att komma ihåg användarens temaval. Ingen automatisk utgångstid finns; uppgifterna kan tas bort genom att rensa webbplatsdata. Ny match nollställer mål, behåller hemmalagets namn och återställer bortalagets namn till Bortalag. Appen sätter inga egna kakor och har ingen reklam, spårning eller besöksstatistik. Matchuppgifter skickas inte till en server. För offline-start sparar en service worker även appens HTML, JavaScript, CSS, manifest och ikoner i Cache Storage. Appfiler kan ersättas vid en uppdatering utan att matchlagringen rensas. Cache och matchdata kan tas bort via webbläsarens webbplatsdata.

Bedömningen för den aktuella funktionen är att lagringen behövs för den begärda tjänsten att behålla matchen, och därför används ingen samtyckesbanner. Se [PTS om nödvändiga kakor och samtycke](https://www.pts.se/internet-och-telefoni/kakor-cookies/). Om statistik, reklam eller annan lagring läggs till måste bedömningen göras om.

## Installera och använd offline

Den utfällbara sektionen **Installera och använd offline** finns längst ned, intill lagringsinformationen. Båda telefoninstruktionerna är alltid tillgängliga. Ingen enhetsdetektering används.

### iPhone

Öppna Målräknare i Safari medan du har internet. Tryck på Dela och välj **Lägg till på hemskärmen**. Välj **Öppna som webbapp** om alternativet visas och tryck på **Lägg till**. Starta sedan Målräknare från ikonen på hemskärmen.

### Android

Öppna Målräknare i Chrome medan du har internet. Tryck på menyn **⋮** och välj **Installera app** eller motsvarande installationsval. Följ anvisningarna och starta sedan Målräknare från ikonen.

### Offline-start och uppdateringar

Öppna sidan med internet och vänta tills installationssektionen visar **Redo att användas offline på den här enheten**. Statusen ges efter att service workern installerat filerna; vid senare starter kontrolleras också att sparad HTML finns kvar. Öppna även hemskärmsappen online första gången och kontrollera statusen där. En hemskärmsapp kan ha separat lagring från webbläsaren beroende på plattform; utgå inte från att en redan påbörjad match flyttas över.

HTML, JavaScript (inklusive dynamiska moduler), CSS, manifest och ikoner förlagras med Workbox. Navigering inom `/matchraknare/` använder den sparade startsidan utan nät. Service workern registreras bara i produktionsbygget; `npm run dev` har inte offline-stöd. Manifestets `id`, `start_url` och `scope`, liksom service workerns scope och navigeringsreserv, pekar på `/matchraknare/`. GitHub Pages-arbetsflödet är oförändrat.

En upptäckt ny version väntar i bakgrunden. **Uppdatera nu** sparar matchen innan den nya versionen aktiveras och sidan laddas om. Om matchen inte kan sparas avbryts uppdateringen och ett fel visas. **Senare** döljer meddelandet utan omladdning; valet finns kvar i installationssektionen. Om alla appflikar stängs kan webbläsaren aktivera den väntande versionen inför nästa start. Ingen pågående öppen match laddas då om. Uppdateringar rensar inte `localStorage`.

Offline kräver ett lyckat första besök över HTTPS (eller localhost vid test). Första besöket utan nät fungerar inte. Webbläsaren kan rensa cache eller matchdata, exempelvis vid lagringsbrist; privat surfning kan begränsa funktionerna. Installation är ingen garanti för permanent lagring eller säkerhetskopiering. Namn och mål stannar på enheten, utan konto eller synkronisering.

### Testa produktionsbygget

```sh
npm ci
npm run lint
npm test
npm run build
npm run preview
```

Öppna `http://localhost:4173/matchraknare/`. PWA-test kräver localhost eller HTTPS; en vanlig HTTP-adress med datorns LAN-IP räcker inte för att testa installation på en telefon.

Automatiska webbläsartester:

```sh
npx playwright install chromium
npm run test:pwa
```

Testerna serverar verkliga `dist` under `/matchraknare/` och kör i Chromium. De använder en temporär beständig webbläsarprofil, stänger hela testwebbläsaren, startar den utan nät, ändrar mål och startar om utan nät ännu en gång. Namn och båda lagens poäng kontrolleras. Ett andra test simulerar en senare publicering genom att ändra serverad HTML och dess precache-revision: versionen väntar, **Senare** lämnar matchen aktiv, en godkänd uppdatering laddar den nya versionen och matchen finns kvar även vid en offline-omladdning. Manifest, ikonsökvägar och offlineberedskap kontrolleras också. Testerna publicerar inget och ändrar inte källfiler eller `dist`.

Verifierat lokalt: lint, produktionsbygge, 13 komponenttester och två PWA-webbläsartester passerar. Mobilskärmbild från Chromium finns efter körningen i `test-results/pwa-mobile.png`. Det är simulerat nätbortfall, inte en fysisk telefons flygplansläge.

**Återstår manuellt före release:** installation i aktuell Safari på iPhone och Chrome på Android, exakta menytexter och ikonvisning; öppna hemskärmsappen online tills redo-status visas, stäng appen, slå på flygplansläge, öppna igen, ändra mål och kontrollera ställningen efter ännu en stängning och start. Prova även **Senare** och godkänd uppdatering på telefonerna. Inga fysiska telefoner har varit tillgängliga i denna verifiering.

Ikonerna är ogenomskinliga PNG-filer: 192 och 512 px för Android, 512 px med säker marginal för maskning samt 180 px Apple touch icon. De kan återskapas utan externa Python-bibliotek med `python3 scripts/generate-icons.py`.

## Ljust och mörkt tema

**Utseende** längst ned erbjuder **Följ enheten** (standard), **Ljust** och **Mörkt**. Enhetens tema följs även om det ändras medan appen är öppen. Temavalet sparas separat från matchen i `malraknare.theme.v1` och fungerar offline. Om lagring inte är tillgänglig fungerar valet för den öppna sidan och ett meddelande visas. Matchen påverkas inte. Installationsinformationen ligger ovanför informationen om kakor och lokal lagring.

## Resultattavlans layout

Layouten följer bildförslag 2, Mörk resultattavla: två poängkolumner med en tunn avdelare, färgmarkeringar för lagen och stora siffror. Målknapparna följs direkt av en bred **Ny match**-knapp med fortsatt bekräftelse. Sparstatus, utseende och utfällbar information ligger under matchkontrollerna. Ljust och mörkt tema använder samma layout. Sifferstorleken anpassas till antalet siffror så att även stora poängtal ryms i respektive kolumn.
