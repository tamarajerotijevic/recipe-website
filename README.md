# Veb prodavnica sa receptima
  Ova aplikacija omogućava korisnicima da na brz i jednostavan način pronađu recepte, organizuju sastojke koje već imaju i lakše odluče šta mogu da pripreme bez dugog planiranja. Ideja aplikacije je da kuvanje učini praktičnijim – umesto da korisnik traži recepte pa proverava šta mu nedostaje, aplikacija povezuje recepte i dostupne proizvode na jednom mestu.
  Korisnici mogu pretraživati i filtrirati recepte, označavati omiljene, upravljati sopstvenim proizvodima i koristiti korpu za organizaciju namirnica. Sve funkcionalnosti su objedinjene u preglednom i intuitivnom interfejsu koji omogućava brzo snalaženje i prijatno korišćenje.
  Aplikacija je razvijena korišćenjem savremenih web tehnologija – React na frontend strani, Node.js i Express na backendu i MySQL bazu podataka – što obezbeđuje stabilnost, brzinu i mogućnost daljeg razvoja i proširenja funkcionalnosti.

## Tim
- Tamara Jerotijević 2022/0362
- Jovana Dumić 2023/1017
- Sandra Đurić 2022/0137

## Tehnologije
Frontend:
- React
- JavaScript
- Bootstrap

Backend:
- Node.js
- Express
- Sequelize

Baza podataka:
- MySQL

## Tipovi korisnika
- Gost – može pregledati proizvode i recepte.
- Registrovani korisnik – može koristiti korpu i upravljati omiljenim receptima.
- Administrator – može dodavati i brisati proizvode i recepte.

## Uputstvo za pokretanje projketa
1. Preuzimanje projekta
Klonirati repozitorijum:
git clone <link-do-repozitorijuma>
cd projekat

2. Pokretanje baze
Pokrenuti XAMPP i startovati Apache i MySQL.
Otvoriti u pregledaču:
http://localhost/phpmyadmin
Kreirati bazu podataka sa nazivom koji je naveden u .env fajlu backend-a.

3. Pokretanje backend-a
U terminalu:
cd backend
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm start

Backend će biti dostupan na:
http://localhost:3001

4. Pokretanje frontend-a
U drugom terminalu:
cd frontend
npm install
npm run dev

Frontend će biti dostupan na:
http://localhost:5173

5. Prijava u aplikaciju
Nakon pokretanja moguće je registrovati novog korisnika,prijaviti se postojećim nalogom.

## API dokumentacija (Swagger) 
 
Swagger UI je dostupan na: 
http://localhost:3001/api-docs 
 
OpenAPI specifikacija se generiše iz Swagger anotacija u: 
backend/routes/*.routes.js 
 
Swagger konfiguracija i šeme (schemas) su u: 
backend/config/swagger.js 
