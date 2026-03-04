# 🔗 URL Shortener — Full Project Build Plan

> **Stack:** React + Vite · Node.js + Express · PostgreSQL  
> **Features:** Custom slugs · QR Code generation  
> **Target:** Local development

---

## 1. Project Overview

A full-stack URL shortener that converts long URLs into short, shareable links. Users can optionally set a custom slug and generate a QR code for any link.

### In Scope
- Shorten any valid URL into a unique short link
- Custom slug support (user picks their own code)
- Auto-generated slug fallback using nanoid (6 chars) if none provided
- QR Code generation per link (client-side)
- Dashboard to view all created links
- Copy short link to clipboard
- Delete links
- Server-side 301 redirect

### Out of Scope (for now)
- Click analytics / visit counting
- Link expiry / TTL
- User authentication
- Production deployment

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | UI — form, link list, QR modal |
| Backend | Node.js + Express | REST API + redirect logic |
| Database | PostgreSQL | Persistent URL mappings |
| QR Code | qrcode.react | Client-side QR rendering |
| HTTP Client | Axios | Frontend → backend calls |
| Slug Generator | nanoid v3 | Auto-generate unique short codes |
| Dev Tool | nodemon | Auto-restart backend on changes |

---

## 3. Project Structure

```
url-shortener/
├── backend/
│   ├── index.js            ← Express app entry point
│   ├── db.js               ← PostgreSQL connection pool
│   ├── routes/
│   │   └── links.js        ← All API route handlers
│   ├── .env                ← Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         ← Root component
│   │   ├── api.js          ← Axios API calls
│   │   └── components/
│   │       ├── ShortenForm.jsx   ← URL + slug input form
│   │       ├── LinkCard.jsx      ← Individual link row
│   │       └── QRModal.jsx       ← QR code popup
│   ├── vite.config.js      ← Proxy /api → localhost:5000
│   └── package.json
│
└── README.md
```

---

## 4. Database Schema

```sql
CREATE TABLE links (
  id           SERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code   VARCHAR(20) UNIQUE NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-incrementing primary key |
| original_url | TEXT NOT NULL | The full destination URL |
| short_code | VARCHAR(20) UNIQUE | Slug — custom or auto-generated |
| created_at | TIMESTAMP | Auto-set on insert |

---

## 5. API Endpoints

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/api/links` | `{ original_url, short_code? }` | Create a short link |
| GET | `/api/links` | — | Return all links |
| GET | `/:code` | — | Redirect to original URL (301) |
| DELETE | `/api/links/:code` | — | Delete a link |

### Validation Rules (POST /api/links)
- `original_url` must start with `http://` or `https://`
- `short_code` must be alphanumeric + hyphens only, max 20 chars
- Duplicate `short_code` → 409 Conflict
- No `short_code` provided → auto-generate 6-char nanoid

---

## 6. Build Phases

### Phase 1 — Backend

| Step | File | Task | Done? |
|------|------|------|-------|
| 1 | `index.js` | Init Express, add CORS + JSON middleware, load .env, start on PORT 5000 | [ ] |
| 2 | `db.js` | Create pg Pool from .env, export pool, auto-create links table on startup | [ ] |
| 3 | `routes/links.js` | POST /api/links — validate, generate slug if needed, insert, return record | [ ] |
| 4 | `routes/links.js` | GET /api/links — fetch all rows ordered by created_at DESC | [ ] |
| 5 | `index.js` | GET /:code — lookup short_code, 301 redirect or 404 | [ ] |
| 6 | `routes/links.js` | DELETE /api/links/:code — remove record by short_code | [ ] |

### Phase 2 — Frontend

| Step | File | Task | Done? |
|------|------|------|-------|
| 7 | `vite.config.js` | Setup Vite proxy: `/api` → `http://localhost:5000` | [ ] |
| 8 | `src/api.js` | Axios wrapper: `createLink()`, `getLinks()`, `deleteLink()` | [ ] |
| 9 | `ShortenForm.jsx` | URL input, optional slug input, submit handler, inline error display | [ ] |
| 10 | `LinkCard.jsx` | Display short URL, copy-to-clipboard, delete button, QR trigger | [ ] |
| 11 | `QRModal.jsx` | Modal with QR code via qrcode.react, close button | [ ] |
| 12 | `App.jsx` | Wire everything: state, fetch on mount, pass handlers down | [ ] |

### Phase 3 — Polish

- [ ] Error handling for all edge cases
- [ ] Loading states on buttons during API calls
- [ ] Empty state when no links exist
- [ ] Responsive layout (mobile + desktop)
- [ ] Test all endpoints with curl / Postman
- [ ] End-to-end test: shorten → copy → paste in browser → verify redirect

---

## 7. Error Handling

| Scenario | HTTP Code | Message |
|----------|-----------|---------|
| Duplicate short code | 409 | "Short code already taken. Try a different one." |
| Invalid URL format | 400 | "Please enter a valid URL starting with http(s)://" |
| Short code not found | 404 | "Short link not found." |
| Invalid slug chars | 400 | "Slug can only contain letters, numbers, and hyphens." |
| DB error | 500 | "Something went wrong. Please try again." |

---

## 8. Environment Variables

```env
# backend/.env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=url_shortener
DB_USER=shortener_user
DB_PASSWORD=yourpassword
BASE_URL=http://localhost:5000
```

---

## 9. How to Run

```bash
# Terminal 1 — Backend
cd url-shortener/backend
npm run dev

# Terminal 2 — Frontend
cd url-shortener/frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Short links | http://localhost:5000/:code |

---

## 10. Definition of Done

- [ ] User can paste a long URL and get a short link back
- [ ] User can optionally set a custom slug
- [ ] Duplicate slug shows a clear error message
- [ ] QR code modal opens and renders a scannable code
- [ ] All links persist in PostgreSQL across server restarts
- [ ] Delete removes the link from DB and UI
- [ ] Visiting `http://localhost:5000/:code` redirects in the browser
- [ ] Copy button copies the short URL to clipboard
- [ ] App works on desktop and mobile