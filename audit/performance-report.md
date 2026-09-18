# Performance Audit Report

**Application**: Maitri Men's Wear (Noir Studio)  
**Date**: 2026-09-18  
**Scope**: Full Stack (Frontend Next.js, Redux, React, Node.js Express, MongoDB Mongoose)  

---

## Performance Summary

| Issue ID | Area | Title | Severity | Impact | Status |
|---|---|---|---|---|---|
| **PERF-001** | Database | Unbounded Queries & Missing Compound Indexes | **HIGH** | Slow DB queries under scale, high CPU | Open |
| **PERF-002** | API / Network | Over-fetching & Missing Projections on Products/Orders | **MEDIUM** | Bloated JSON payloads, high latency | Open |
| **PERF-003** | Frontend / State | Synchronous setState in useEffect (Cascading Re-renders) | **MEDIUM** | UI frame drops, unnecessary renders | Open |
| **PERF-004** | API / Network | Missing HTTP Response Compression | **LOW** | 60-70% larger response sizes | Open |
| **PERF-005** | Architecture | Redundant Global State & 9 Fragmented RTK Query APIs | **LOW** | Memory overhead, fragmented cache | Open |

---

## Detailed Performance Issues

### PERF-001: Unbounded Queries & Missing Compound Indexes
- **Severity**: HIGH
- **Location**:
  - `server/controller/productController.js` (`Product.find(query)`)
  - `server/controller/orderController.js` (`Order.find()`)
  - `server/controller/messageController.js` (`Message.find()`)
- **Problem**: 
  1. No default pagination (`limit` / `skip`). When thousands of products, orders, or messages accumulate, the server attempts to load all documents into RAM and serialize them into JSON.
  2. Missing compound indexes: queries frequently filter on `{ isDeleted: false, category: ... }` and sort by `{ createdAt: -1 }`. Without compound indexes, MongoDB performs in-memory sorts (COLLSCAN + SORT).
- **Recommended Solution**:
  - Add compound indexes:
    - `productSchema.index({ isDeleted: 1, status: 1, category: 1, createdAt: -1 });`
    - `productSchema.index({ isDeleted: 1, price: 1 });`
    - `orderSchema.index({ user: 1, isDeleted: 1, createdAt: -1 });`
    - `messageSchema.index({ isRead: 1, createdAt: -1 });`
  - Implement default pagination limits (e.g. max 50 items per request).

---

### PERF-002: Over-fetching & Missing Projections on Products
- **Severity**: MEDIUM
- **Location**: `server/controller/productController.js` (`getAllProducts`)
- **Problem**: In catalogue listings (`/shop`, homepage), returning full variants, custom attributes, and descriptions for every product balloons the JSON payload from ~15KB to >150KB.
- **Recommended Solution**: Use Mongoose `.select()` on catalogue listing queries to exclude heavyweight unused fields (such as long `description`, `washCare`, and unneeded metadata) on general browse listings.

---

### PERF-003: Synchronous setState in useEffect (Cascading Re-renders)
- **Severity**: MEDIUM
- **Location**:
  - `client/src/context/ThemeContext.tsx:44, 59`
  - `client/src/context/CartContext.tsx:44`
  - `client/src/context/WishlistContext.tsx:23`
- **Problem**: Synchronous `setState` inside `useEffect` causes immediate second render cycles right after mount, delaying First Contentful Paint (FCP) and causing hydration layout shifts.
- **Recommended Solution**: Initialize state directly in `useState(() => ...)` lazy initializers where possible, and avoid setting synchronous state in effects unless responding to external events.

---

### PERF-004: Missing HTTP Response Compression
- **Severity**: LOW
- **Location**: `server/index.js`
- **Problem**: The Express server does not use Gzip/Brotli compression middleware (`compression`).
- **Recommended Solution**: Install and register `compression()` in `server/index.js` to reduce API response sizes by up to 70%.
