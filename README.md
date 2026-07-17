# Mandado App

A mobile-first grocery listing web app. Browse products by category, build a shopping cart, and export it as an Excel file.

## Features

- Browse products grouped by category
- Search and filter products by name
- Add/remove products to a shopping cart with quantity controls
- Export cart to `.xlsx` (grouped by category, with subtotals and totals)

## Tech Stack

- **React 19** + TypeScript
- **Vite** (with React Compiler)
- **TanStack Query** for groceries API data
- **ExcelJS** (lazy-loaded for Excel export)
- Auth and catalog data come from **personal-api** (`VITE_API_BASE_URL`)

## Auth model

Accounts use a single global role from personal-api (`GET /api/v1/auth/me`):

- `READ_ONLY` — browse categories and products
- `ADMIN` — browse plus product admin mutations

There are no per-application permission slugs. Login stores only a refresh token locally; the access token stays in memory.

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Configured for GitHub Pages with `base: '/full-groceries-app/'` in `vite.config.ts`.
Production builds use `VITE_API_BASE_URL=https://personal-api-production-3ca6.up.railway.app` (see `.github/workflows/deploy.yml`).

Live site: https://franciscoveloz1.github.io/full-groceries-app/

## Project Structure

```
src/
  components/    # Reusable UI (ProductCard, CategoryCard, SearchBar, CartBadge)
  pages/         # Page views (CategoriesPage, ProductListPage, CartPage)
  hooks/         # useProducts, useCategories, useCart
  utils/         # Excel export utility
  data/          # Categories mapping
data/
  products.json  # Static product data
```
