# MRL | Medobčinska rekreacijska nogometna liga

Celovita, moderna in visoko odzivna spletna aplikacija za vodenje rekreacijske nogometne lige v slovenskem jeziku, optimizirana za mobilne telefone, tablice in namizne računalnike ter pripravljena za takojšnjo objavo na **Vercelu**.

---

## 🌟 Ključne funkcionalnosti

### 1. Tri ločene lige z avtomatiziranim delovanjem
- **1. liga:** 9 ekip (v vsakem krogu 4 tekme + 1 prosta ekipa s pavzo)
- **2. liga:** 8 ekip (v vsakem krogu 4 tekme)
- **3. liga:** 9 ekip (v vsakem krogu 4 tekme + 1 prosta ekipa s pavzo)
- **Obstojen izbirnik lige:** Izbrana liga ostane aktivna med prehajanjem med vsemi podstranmi (shranjeno v `localStorage`).

### 2. Razpored tekem & Bergerjev algoritem
- Samodejno generiranje enokrožnega ali dvokrožnega razporeda po **Bergerjevem kolesju**.
- Za lige z 9 ekipami aplikacija samodejno določi in v glavi kroga jasno izpostavi **ekipo s prostim terminom** (npr. *»Prosta ekipa v 1. krogu: ŠD Moste Titans«*).
- Filtriranje po ligi, krogu, ekipi, prizorišču in datumu.
- Statusi tekem: *napovedana, v teku (V ŽIVO), zaključena, prestavljena, odpovedana*.

### 3. Rezultati in dogodki na tekmah
- Pregled rezultatov po krogih s poudarjenimi končnimi rezultati in polčasi.
- **Podrobna stran posamezne tekme:**
  - Velik stadionski semafor z barvami in logotipi obeh ekip.
  - Časovna os dogodkov (zadetki, enajstmetrovke, avtogoli, rumeni in rdeči kartoni z minutami).
  - Samodejni preračun končnega rezultata iz vnesenih dogodkov.
  - Opombe organizatorja in delegata ter ime glavnega sodnika.

### 4. Samodejne prvenstvene lestvice
- Izračun v realnem času: Mesto, Ekipa, OT, Z, N, P, DG, PG, GR, TOČ, Forma zadnjih 5 tekem (Z-N-P).
- **Nastavljiva uradna merila ob enakem številu točk:**
  1. Število točk
  2. Medsebojne tekme (točke in gol razlika med izenačenimi)
  3. Skupna gol razlika
  4. Večje število doseženih zadetkov
  5. Fair-play lestvica (manj kazenskih točk iz rumenih/rdečih kartonov)
- **Mobilna prilagoditev:** Možnost preklopa med široko tabelo in prilagojenimi karticami za mobilne telefone.
- Gumb za praznovanje prvaka z animacijo konfetov.

### 5. Lestvica strelcev (Zlata kopačka)
- Ločena lestvica za vsako ligo.
- Prikaz: Mesto, Ime in priimek, Ekipa, Število zadetkov, Zadetki z 11m, Odigrane tekme, Povprečje na tekmo.
- Preklop med **Top 5** in **celotno lestvico**.
- Zmagovalni oder za najboljše 3 strelce.

### 6. Katalog in javne strani ekip
- Upravljanje 26 ekip: naziv, kratek naziv, logotip, domače igrišče, kontaktna oseba, telefon, barve dresov.
- **Javna stran vsake ekipe:**
  - Podatki o ekipi in trenutno mesto na lestvici.
  - Seznam registriranih igralcev s številkami dresov in položaji (Vratar, Branilec, Vezist, Napadalec).
  - Vse tekme in rezultati ekipe.
  - Najboljši strelci ekipe.

### 7. Obvestila in pravilnik
- **Obvestila:** Novice z označevanjem pomembnih (rdeča značka), statusom objavljeno/osnutek ter datumom.
- **Pravilnik:** 7 uradnih poglavij (sistem tekmovanja, točkovanje, merila, kartoni, registracije, prestavitve, pritožbe) z možnostjo administratorskega urejanja na mestu.

### 8. Administracija in varnost
- Zaščiten del s prijavo in nadzorno ploščo (metrike, tekme brez rezultata, hitre bližnjice).
- **Štiri uporabniške vloge:**
  - **Glavni administrator:** popoln nadzor nad vsemi podatki.
  - **Urednik rezultatov:** urejanje tekem, rezultatov in dogodkov.
  - **Predstavnik ekipe:** urejanje podatkov in seznama igralcev samo svoje ekipe.
  - **Javni obiskovalec:** bralni dostop.
- Prestop igralca v drugo ekipo s samodejnim preverjanjem zasedenosti številk dresov.
- Potrditvena okna pred brisanjem in preprečevanje podvojenih vnosov.

### 9. Uvoz, izvoz & varnostne kopije
- **Uvoz iz Excel (.xlsx) ali CSV:** ekipe, igralci, razpored tekem.
- **Izvoz v Excel:** razporedi, rezultati, lestvice, strelci.
- **Tiskanje in PDF:** vgrajeni tiskalniški slogi (`@media print`).
- **Varnostna kopija:** prenos celotne baze v JSON in obnova z enim klikom.
- **Ponastavitev na začetne demonstracijske podatke:** možnost vrnitve na privzeto stanje kadarkoli.

---

## 🔑 Demonstracijski računi za prijavo

V administraciji je na voljo tudi **gumb za 1-klik preklop vlog** za takojšen preizkus brez vnašanja gesla:

| Vloga | Uporabniško ime | Geslo | Opis pravic |
|---|---|---|---|
| **Glavni administrator** | `admin` | `admin123` | Popoln nadzor nad vsemi ligami, ekipami in nastavitvami |
| **Urednik rezultatov** | `urednik` | `urednik123` | Vnos in urejanje tekem, rezultatov ter dogodkov |
| **Predstavnik ekipe** | `predstavnik` | `ekipa123` | Urejanje lastne ekipe (ŠD Meteor) in njenih igralcev |

---

## 🚀 Zagon lokalno

1. Odprite terminal v mapi projekta:
   ```bash
   cd C:\Users\Martin\.gemini\antigravity\scratch\rekreacijska-nogometna-liga
   ```
2. Namestite odvisnosti (če še niso nameščene):
   ```bash
   npm install
   ```
3. Zaženite razvojni strežnik:
   ```bash
   npm run dev
   ```
4. Aplikacija se odpre na naslovu `http://localhost:5173`.

---

## ☁️ Objava na Vercelu (Vercel Deployment)

Projekt je 100% pripravljen za brezhibno objavo na Vercelu:
- Konfiguracijska datoteka `vercel.json` z ustreznimi SPA preusmeritvami je že vključena.
- Ni zunanjih strežniških odvisnosti ali potrebe po nastavljanju baz podatkov v okoljskih spremenljivkah.

### Postopek objave:
1. **Preko Vercel CLI:**
   ```bash
   npx vercel
   ```
2. **Preko GitHub / GitLab repozitorija:**
   - Naložite mapo v repozitorij na GitHubu.
   - Prijavite se na [vercel.com](https://vercel.com) in kliknite **"Add New Project"**.
   - Izberite repozitorij; Vercel bo samodejno prepoznal ogrodje **Vite** in nastavil ukaz za gradnjo `npm run build` ter izhodno mapo `dist`.
   - Kliknite **"Deploy"**. V ~20 sekundah bo aplikacija v živo na vaši domeni!
