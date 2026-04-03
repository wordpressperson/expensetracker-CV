# Expense Tracker – Technical Documentation

## 1. Overview

A modern expense tracking web application that allows users to create budgets, log expenses, and visualise spending through charts. Built with **Next.js 14 (App Router)** , **Clerk** for authentication, **Drizzle ORM** with **Neon PostgreSQL**, and **Tailwind CSS** for styling.

---

## 2. Tech Stack

| Category       | Technology                          |
|----------------|-------------------------------------|
| Framework      | Next.js 14 (App Router)             |
| Language       | JavaScript (React)                  |
| Authentication | Clerk                               |
| Database       | PostgreSQL (Neon.tech)              |
| ORM            | Drizzle ORM                         |
| Styling        | Tailwind CSS + shadcn/ui components |
| Charts         | Recharts (via `BarChartDashboard`)  |
| Deployment     | Render.com                          |

---

## 3. Project Structure (Simplified)

```
.
├── app/
│   ├── (auth)/                # Clerk sign‑in/up routes
│   │   ├── sign-in/[[...sign-in]]/page.jsx
│   │   └── sign-up/[[...sign-up]]/page.jsx
│   ├── (routes)/dashboard/    # Protected dashboard
│   │   ├── budgets/           # Budget management
│   │   ├── expenses/          # Expense management
│   │   ├── _components/       # Dashboard‑specific components
│   │   ├── layout.jsx         # Dashboard layout (client‑side)
│   │   └── page.jsx           # Main dashboard view
│   ├── _components/           # Shared components (Hero, Header)
│   ├── layout.jsx             # Root layout (ClerkProvider)
│   └── page.jsx               # Homepage
├── components/ui/             # shadcn/ui components
├── lib/                       # Utility functions
├── utils/
│   ├── dbConfig.jsx           # Drizzle DB connection
│   └── schema.jsx             # Database schemas (Budgets, Expenses)
├── middleware.ts              # Clerk route protection
├── next.config.mjs
├── drizzle.config.js          # Drizzle migrations
├── tailwind.config.js
└── package.json
```

---

## 4. Environment Variables

Create a `.env.local` file (or set them in your deployment platform). **Never commit real secrets.**

| Variable                               | Description                               | Example / Placeholder                 |
|----------------------------------------|-------------------------------------------|---------------------------------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`    | Clerk publishable key (frontend)          | `pk_test_...`                         |
| `CLERK_SECRET_KEY`                     | Clerk secret key (backend)                | `sk_test_...` → **use placeholder**   |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`        | Custom sign‑in route                      | `/sign-in`                            |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`        | Custom sign‑up route                      | `/sign-up`                            |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`  | Where to redirect after login             | `/dashboard` (changed from `/`)       |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`  | Where to redirect after sign‑up           | `/dashboard`                          |
| `NEXT_PUBLIC_DATABASE_URL`             | Neon PostgreSQL connection string         | `postgresql://...` → **use placeholder** |

> **Important:** The `AFTER_SIGN_IN_URL` and `AFTER_SIGN_UP_URL` were changed from `/` to `/dashboard` to fix the redirect flash.

### Placeholders for documentation:

```
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_DATABASE_URL=your_neon_postgresql_connection_string
```

All other variables can be copied from Clerk Dashboard and Neon.tech.

---

## 5. Authentication (Clerk)

- **Middleware** (`middleware.ts`) protects all routes except public ones (`/`, `/sign-in`, `/sign-up`).
- **Root layout** wraps the app with `<ClerkProvider>`.
- **Dashboard layout** (`app/(routes)/dashboard/layout.jsx`) uses `useUser()` from Clerk to get the logged‑in user.
- **Sign‑in/up pages** include `<SignIn afterSignInUrl="/dashboard" />` and `<SignUp afterSignUpUrl="/dashboard" />`.
- The “Get Started” button on the homepage links to `/dashboard` (not `/sign-in`). If unauthenticated, Clerk automatically redirects to sign‑in.

### Critical fix applied (March 2026):
- Changed `href="/sign-in"` → `href="/dashboard"` in `app/_components/Hero.jsx`.
- Added `afterSignInUrl` and `afterSignUpUrl` to Clerk components.

---

## 6. Database (Neon PostgreSQL + Drizzle ORM)

### Schema (`utils/schema.jsx`)
Two main tables:
- **Budgets** – `id`, `name`, `amount`, `createdBy` (email), `createdAt`, etc.
- **Expenses** – `id`, `name`, `amount`, `budgetId` (foreign key), `createdAt`.

### Connection (`utils/dbConfig.jsx`)
```javascript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL);
export const db = drizzle(sql);
```

### Migrations
Run after schema changes:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## 7. Key Features & Components

| Feature               | Implementation                                           |
|-----------------------|----------------------------------------------------------|
| Dashboard overview    | `app/(routes)/dashboard/page.jsx` – displays cards, bar chart, latest budgets, recent expenses. |
| Create/Edit Budget    | `app/(routes)/dashboard/budgets/_components/CreateBudget.jsx` |
| Add Expense           | `app/(routes)/dashboard/expenses/_components/AddExpense.jsx` |
| Bar Chart             | `BarChartDashboard.jsx` – uses Recharts to visualise budget vs spend. |
| Responsive Sidebar    | `SideNav.jsx` – fixed on desktop, hidden on mobile (can be extended). |

---

## 8. Deployment on Render.com

### Steps
1. Push code to GitHub repository.
2. Log into Render → **New +** → **Static Site** (or **Web Service** for Next.js with serverless functions).
3. Connect your GitHub repo.
4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add all variables from section 4 (use actual values, not placeholders).
5. Set **Node version** to 18.x or 20.x.
6. Click **Deploy**.

### Important
- Render automatically provides an HTTPS URL – Clerk requires that for OAuth redirects. Add your Render URL to **Clerk Dashboard → Domains**.
- For database migrations on Render, either:
  - Run `npx drizzle-kit migrate` manually after deploy (via Render Shell), or
  - Add a post‑build script in `package.json`: `"postbuild": "npx drizzle-kit migrate"`

---

## 9. Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Neon.tech)

### Setup
```bash
git clone https://github.com/wordpressperson/expensetracker-CV.git
cd expensetracker-CV
npm install
```

Create `.env.local` with the variables from section 4 (use your actual Clerk keys and database URL).

Run migrations:
```bash
npx drizzle-kit migrate
```

Start dev server:
```bash
npm run dev
```

Open `http://localhost:3000`.

---

## 10. Maintenance & Troubleshooting

| Problem                          | Likely cause & solution                                                                 |
|----------------------------------|------------------------------------------------------------------------------------------|
| Redirect loop after login        | Check `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` – should be `/dashboard`. Also verify Hero.jsx button link. |
| Dashboard shows no data          | Confirm database connection string is correct and user’s email matches `createdBy` field. |
| “Get Started” still shows login page | Clear browser cache / local storage. Ensure middleware publicRoutes includes `/`.        |
| Expense chart not updating       | Check that `refreshData` callback is passed correctly to `ExpenseListTable`.             |
| Drizzle errors                   | Run `npx drizzle-kit generate` after schema changes.                                     |

---

## 11. Credits & Maintenance Handover

- **Original developer:** [wordpressperson](https://github.com/wordpressperson)
- **Authentication fix (March 2026):** Corrected “Get Started” button link and Clerk redirect URLs.
- **For future maintainers:**  
  - Keep Clerk keys and database URL secret.  
  - Use `drizzle-kit` for all schema changes.  
  - Test sign‑up flow on deployment preview before merging to main.

---

## 12. Appendix – Example `.env.local` (placeholders only)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_DATABASE_URL=postgresql://username:password@host:port/database
```

---

**End of documentation** – any new developer can now clone, configure, and deploy the app confidently.
