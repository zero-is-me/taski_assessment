# taSki-assessment

Full-stack Ticket Booking + Wallet + Admin MVP built with:

- Backend: Node.js + Express
- Frontend: React + Vite
- Database: MongoDB + Mongoose
- Auth: JWT in `Authorization` header

## Repo structure

```text
taSki-assessment/
├── client/
├── server/
├── postman_collection.json
└── README.md
```

## Local setup

1. Create a MongoDB database locally or use MongoDB Atlas.
2. Copy `server/.env.example` to `server/.env` and fill in the values.
3. Copy `client/.env.example` to `client/.env` and fill in the values.
4. Install dependencies:

```bash
cd server && npm install
cd ../client && npm install
```

5. Start the backend:

```bash
cd server
npm run dev
```

6. Start the frontend:

```bash
cd client
npm run dev
```

7. Open `http://localhost:5173`

## Environment variables

### Server

- `PORT`: Express server port
- `MONGODB_URI`: Mongo connection string
- `JWT_SECRET`: secret used to sign JWTs
- `JWT_EXPIRES_IN`: token expiry, for example `7d`
- `CLIENT_URL`: frontend URL used by CORS

### Client

- `VITE_API_URL`: backend API base URL, for example `http://localhost:5000/api`

## Core flows

- User register/login with JWT auth
- Wallet top-up and transaction history
- Event list and seat map
- Reserve seats for 5 minutes
- Confirm booking with wallet deduction inside a MongoDB transaction
- Admin event management, booking listing, transaction listing, and cancel + refund flow

## Design decisions

- Money is stored as integer paise everywhere and converted to rupees only for display in the UI.
- Booking confirmation runs inside a MongoDB session so seat claiming, wallet deduction, booking creation, seat booking, and debit transaction stay atomic.
- Expired seat holds are cleared before seat reads and booking/reservation actions, which keeps seat status fresh without needing websockets.
- JWT is stored in `localStorage` and attached through a shared Axios instance because the frontend spec explicitly called for that behavior.

## Assumptions made

- `React + Vite` was chosen for the frontend.
- `/admin/login` is a separate frontend page, but it uses the same backend `/api/auth/login` route and then enforces `role === 'admin'`.
- The admin bulk seat creation route updates the event-level `priceInPaise`, since price exists on `Event` and not on individual `Seat` documents.
- The spec mentions a unique index on `seatId + status`, but with a single mutable seat document that would block valid state changes. This implementation uses atomic `findOneAndUpdate({ status: 'available' })` plus a unique `{ eventId, seatNumber }` seat identity index.

## Seed/admin note

There is no seed script in the MVP. To create an admin, either:

- change a user's `role` to `admin` directly in MongoDB, or
- insert an admin user manually with a bcrypt-hashed password

## Deployment targets

- Backend target: Render free tier
- Frontend target: Vercel

This workspace does not have deployment credentials wired in, so the repo includes deploy-ready env setup and scripts, but the actual live deployment step still needs to be done from your own Render/Vercel accounts.
