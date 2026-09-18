# Codebase Baseline Report

**Project**: Maitri Men's Wear (Noir Studio)  
**Date**: 2026-09-18  
**Auditor**: Senior Application Security Engineer & Performance Architect  
**Environment**: Windows 11 / Node.js v20+ / Express 5 / Next.js 16 / MongoDB Mongoose 9  

---

## 1. System & Architecture Overview

### Frontend
- **Framework**: Next.js 16.2.12 (Turbopack)
- **React**: 19.2.4
- **State Management**: Redux Toolkit 2.12.0 (9 separate `createApi` instances) + 7 React Context Providers (`AuthContext`, `AdminContext`, `CartContext`, `WishlistContext`, `OrderContext`, `ToastContext`, `SearchContext`)
- **Styling & Animation**: Tailwind CSS 4, Framer Motion 12.42.2, GSAP 3.15.0
- **Rendering Strategy**: Mixed (Predominantly Client Components with `"use client"`)

### Backend
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB via Mongoose 9.9.1
- **Authentication**: JWT (`jsonwebtoken` 9.0.3) + Cookie Parser + bcryptjs 3.0.3
- **Payment Gateway**: Razorpay 2.9.8
- **Hosting**: Vercel Serverless Functions (`server/vercel.json` + `client/package.json`)

---

## 2. Baseline Measurements

### A. Build Status
- **Client Build (`next build`)**: PASS (27 routes generated in 16.5s)
- **TypeScript**: 0 compiler errors (`tsc --noEmit` clean)
- **Lint Status (`eslint`)**: 
  - **74 Errors, 99 Warnings** (173 total problems)
  - Key lint issues: synchronous `setState` inside `useEffect` triggering cascading re-renders in `ThemeContext`, `CartContext`, `WishlistContext`; `react-hooks/refs` access during render.

### B. Dependency Security Audit (`npm audit`)
- **Server**: 1 Moderate vulnerability (`qs` bracket-key comma parsing / DoS GHSA-4mjr-xmp4-gh2g)
- **Client**: 5 vulnerabilities (1 Critical, 4 High)
  - **Critical**: Next.js 16.2.12 (GHSA-p293-qw3h-jr36: Remote Code Execution on Windows-hosted servers, GHSA-2xp9-vwfh-vxw4: RCE in Image Optimization)
  - **High**: PostCSS (GHSA-qx2v-qp2m-jg93: XSS, GHSA-6g55-p6wh-862q: Arbitrary file read)
  - **High**: nanoid (GHSA-2v37-7h3g-55p8: custom generator infinite loop)
  - **High**: js-yaml (GHSA-2883-xcg3-v3hh)

### C. Existing Security Controls Status
| Control | Status | Observation |
|---|---|---|
| **Helmet / Security Headers** | ❌ Missing | No security headers set on Express responses. |
| **CORS Policy** | ❌ Insecure | Wildcard reflection of `req.headers.origin` with credentials allowed. |
| **Rate Limiting** | ❌ Missing | No rate limiting on login, registration, contact forms, or payments. |
| **Input Validation** | ❌ Incomplete | No schema validation library (Zod/Joi). Direct query and body binding. |
| **NoSQL Injection Defense** | ⚠️ Partial | Mongoose casting protects ObjectIds, but `$regex` and queries accept raw client objects. |
| **Authentication Secrets** | ❌ Flawed | Fallback secret `"secret"` used if env missing. Admin credentials hardcoded in frontend. |
| **Authorization Checks (RBAC)** | ⚠️ Flawed | Hardcoded email exceptions (`shubhamwadje2005@gmail.com`) in backend middleware. |
| **Object Level Authorization (BOLA/IDOR)** | ❌ Broken | `GET /api/orders/:id` allows any user to read any other user's order. |
| **Order Price Integrity** | ❌ Broken | Client-supplied `item.price` accepted without database price validation. |
| **Payment Verification** | ⚠️ Flawed | `POST /api/orders` allows setting `paymentStatus: "paid"` without Razorpay verification. |

### D. Existing Performance Controls Status
| Metric / Component | Status | Observation |
|---|---|---|
| **MongoDB Indexes** | ⚠️ Minimal | Only basic indexes (`slug`, `category`, `sku`). Missing compound query indexes. |
| **Pagination** | ❌ Missing | `/api/products`, `/api/orders`, `/api/messages` return unbounded arrays. |
| **Compression** | ❌ Missing | `compression` middleware not installed on Express. |
| **Server Cold Start** | ⚠️ Mitigated | Connection pooling singleton recently implemented in `index.js`. |
| **Frontend Hero Sequence** | ✅ Optimized | Frames reduced from 101 to 25, RAM cut from ~1GB to <60MB. |
| **Noise Overlay GPU Load** | ✅ Optimized | Replaced heavy SVG `feTurbulence` with CSS radial pattern. |
