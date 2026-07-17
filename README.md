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
- **ExcelJS** (lazy-loaded for Excel export)
- No backend — all data is static JSON, all logic runs client-side

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
