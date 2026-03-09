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

## Konfiguracija okruženja

### Backend (.env)
Promenljive:
- DB_USER, DB_PASS, DB_NAME, DB_HOST, DB_PORT, DB_DIALECT
- JWT_SECRET, JWT_EXPIRES_IN
- SPOONACULAR_API_KEY (za nutritivne vrednosti)

### Frontend (.env)
Za korišćenje cloud backend-a, postaviti:
- VITE_API_URL : https://internet-tehnologije-2025-qkec.onrender.com/api

## CI/CD
Pipeline je definisan u [.github/workflows/ci.yml](.github/workflows/ci.yml).
- Pokreće testove na svaki push i pull request.
- Gradi Docker image i pushuje u GHCR.
- Okida automatski deploy na Render preko Deploy Hook (za granu main).

## Deployment (Cloud)
Backend i frontend mogu da rade na Renderu, a baza na Aiven MySQL.
Za frontend obavezno podesite VITE_API_URL na backend + /api.

Produkcioni URL-ovi:
- Frontend: https://internet-tehnologije-2025-ovoj.onrender.com
- Backend: https://internet-tehnologije-2025-qkec.onrender.com

## Javni API
Na stranici recepata postoji sekcija „Inspiracija iz javnog API-ja“ koja koristi TheMealDB.
Ovi recepti su odvojeni i ne utiču na postojeće proizvode i korpu.

## Pokretanje pomoću Docker-a
 
Aplikacija se može pokrenuti i pomoću Docker-a i docker-compose-a, bez potrebe za ručnim instaliranjem Node.js ili MySQL baze.
 
### 1. Pokretanje aplikacije
 
U root direktorijumu projekta pokrenuti:
 
docker compose up --build
 
Ako se želi pokretanje u pozadini:
 
docker compose up --build -d
 
Ova komanda će pokrenuti sledeće servise:
- MySQL bazu
- phpMyAdmin
- backend server
- frontend aplikaciju
 
### 2. Pokretanje migracija i seed podataka
 
Nakon pokretanja kontejnera potrebno je izvršiti migracije i ubaciti početne podatke:
 
docker compose exec backend npx sequelize-cli db:migrate
docker compose exec backend npx sequelize-cli db:seed:all
 
### 3. Pristup aplikaciji
 
Frontend:
http://localhost:5173
 
Backend:
http://localhost:3001
 
phpMyAdmin:
http://localhost:8080
 
MySQL baza:
localhost:3308
 
### 4. Zaustavljanje aplikacije
 
Za zaustavljanje kontejnera:
 
docker compose down
 
Za brisanje i Docker volumena (baze):
 
docker compose down -v