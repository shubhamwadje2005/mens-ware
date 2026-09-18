# OWASP Top 10 Security Audit Report

**Application**: Maitri Men's Wear (Noir Studio)  
**Date**: 2026-09-18  
**Standard**: OWASP Top 10 (2021/2025)  

---

## Findings Summary

| Issue ID | Category | Title | Severity | Priority | Status |
|---|---|---|---|---|---|
| **SEC-001** | A01: Broken Access Control | IDOR / BOLA in Order Details (`/api/orders/:id`) | **CRITICAL** | **P0** | Open |
| **SEC-002** | A04: Insecure Design | Client-Controlled Item Pricing in Order Creation | **CRITICAL** | **P0** | Open |
| **SEC-003** | A04: Insecure Design | Unverified Online Payment Status Bypass | **CRITICAL** | **P0** | Open |
| **SEC-004** | A02: Cryptographic Failures | Hardcoded Admin Credentials & Personal Data in Source | **CRITICAL** | **P0** | Open |
| **SEC-005** | A02: Cryptographic Failures | Plaintext Password Storage in LocalStorage | **HIGH** | **P1** | Open |
| **SEC-006** | A05: Security Misconfiguration | Permissive Reflected CORS with Credentials Allowed | **HIGH** | **P1** | Open |
| **SEC-007** | A02: Cryptographic Failures | Insecure JWT Fallback Secret & Non-Expiring Admin Tokens | **HIGH** | **P1** | Open |
| **SEC-008** | A03: Injection | ReDoS / RegEx Injection in Product Search | **HIGH** | **P1** | Open |
| **SEC-009** | A04: Insecure Design | Missing Rate Limiting on Auth, Contact & Payments | **MEDIUM** | **P1** | Open |
| **SEC-010** | A05: Security Misconfiguration | Missing Security Headers (Helmet / CSP / MIME Guard) | **MEDIUM** | **P2** | Open |
| **SEC-011** | A08: Software & Data Integrity | Mass Assignment in Address & Profile Operations | **MEDIUM** | **P2** | Open |
| **SEC-012** | A06: Outdated Components | Critical/High CVEs in Next.js & Dependencies | **HIGH** | **P1** | Open |

---

## Detailed Vulnerability Reports

### SEC-001: IDOR / BOLA in Order Retrieval
- **Severity**: CRITICAL
- **Priority**: P0 (Fix Immediately)
- **File**: [`server/controller/orderController.js`](file:///d:/project-my/mens-weare/server/controller/orderController.js#L115-L128)
- **Problem**: `getOrderById` fetches the order by `req.params.id` without checking if the authenticated user (`req.user`) owns the order or has the `admin` role.
- **Impact**: Any authenticated user can view the full personal details, contact number, delivery address, ordered items, and payment transactions of every other customer.
- **Attack Scenario**: Attacker registers an account, obtains a valid JWT token, and queries `GET /api/orders/6aa10...` with sequential ObjectIDs, dumping all customer database records.
- **Recommended Fix**: Add ownership verification:
  ```javascript
  const isOwner = order.user && order.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Access denied. You do not own this order." });
  }
  ```
- **Risk of Fix**: Low. Legitimate customers and admins continue to view their own orders.

---

### SEC-002: Client-Controlled Item Pricing in Order Creation
- **Severity**: CRITICAL
- **Priority**: P0 (Fix Immediately)
- **File**: [`server/controller/orderController.js`](file:///d:/project-my/mens-weare/server/controller/orderController.js#L27-L33)
- **Problem**: In `createOrder`, the server calculates order totals using `item.price` sent directly in the HTTP request payload:
  `const prodPrice = Number(item.price !== undefined ? item.price : product?.price) || 0;`
- **Impact**: Arbitrary price manipulation. An attacker can buy luxury items worth ₹25,000 for ₹1.
- **Attack Scenario**: Attacker intercepts checkout POST request with Burp Suite or browser DevTools and changes `item.price: 1` before dispatching. The order is recorded in the database with a total of ₹1.
- **Recommended Fix**: Recalculate price strictly from the database `Product` and variant models. Never trust `item.price` from the client.
- **Risk of Fix**: Low.

---

### SEC-003: Unverified Online Payment Status Bypass
- **Severity**: CRITICAL
- **Priority**: P0 (Fix Immediately)
- **File**: [`server/controller/orderController.js`](file:///d:/project-my/mens-weare/server/controller/orderController.js#L68-L81)
- **Problem**: `createOrder` accepts `paymentStatus` and `paymentMethod` from `req.body`. If `paymentMethod === "Online Payment"`, it automatically sets status to `"paid"` and generates a mock `paymentId: "pay_" + Date.now()` if none is provided.
- **Impact**: Any user can submit an order claiming it has been paid online without executing a single rupee transaction through Razorpay.
- **Attack Scenario**: Attacker dispatches `POST /api/orders` with `{ paymentMethod: "Online Payment", paymentStatus: "paid" }`. The warehouse marks the order as paid and dispatches goods without receiving money.
- **Recommended Fix**: Online orders created before payment verification must always be initialized with `paymentStatus: "pending"`. Transitioning to `"paid"` must strictly happen in `verifyPayment` after valid Razorpay HMAC-SHA256 signature verification.
- **Risk of Fix**: Low.

---

### SEC-004: Hardcoded Admin Credentials & Personal Data in Source Code
- **Severity**: CRITICAL
- **Priority**: P0 (Fix Immediately)
- **Files**:
  - [`client/src/app/admin/login/page.tsx`](file:///d:/project-my/mens-weare/client/src/app/admin/login/page.tsx#L99-L106)
  - [`client/src/context/AuthContext.tsx`](file:///d:/project-my/mens-weare/client/src/context/AuthContext.tsx#L56-L65)
  - [`server/middweare/auth.js`](file:///d:/project-my/mens-weare/server/middweare/auth.js#L56-L61)
- **Problem**: The frontend file contains commented-out credentials (`shubhamwadje2005@gmail.com` / `admin@3428`) included in public client bundles. The backend middleware includes a hardcoded email check for admin authorization.
- **Impact**: Full administrative takeover. Anyone reading the frontend source can authenticate as administrator.
- **Attack Scenario**: A user opens browser DevTools, searches for `"admin"` in the Next.js chunks, finds the hardcoded credentials, and logs into the admin portal.
- **Recommended Fix**: Remove all hardcoded credentials from frontend and backend code. Admin rights must be determined strictly by `role === "admin"` in the database.
- **Risk of Fix**: Low.

---

### SEC-005: Plaintext Password Storage in Browser LocalStorage
- **Severity**: HIGH
- **Priority**: P1 (Fix Before Production)
- **File**: [`client/src/context/AuthContext.tsx`](file:///d:/project-my/mens-weare/client/src/context/AuthContext.tsx#L22-L41)
- **Problem**: `AuthContext` saves user passwords in plaintext under `noir-user-pwd` and maintains a client-side database `noir-users`.
- **Impact**: Any XSS payload, browser extension, or shared device user can read all plaintext passwords.
- **Recommended Fix**: Remove all password caching from LocalStorage. Authentication must rely solely on JWT tokens.
- **Risk of Fix**: Low.

---

### SEC-006: Permissive Reflected CORS with Credentials Allowed
- **Severity**: HIGH
- **Priority**: P1 (Fix Before Production)
- **File**: [`server/index.js`](file:///d:/project-my/mens-weare/server/index.js#L19-L42)
- **Problem**: The CORS handler reflects any origin (`res.setHeader("Access-Control-Allow-Origin", origin)`) while simultaneously allowing credentials (`Access-Control-Allow-Credentials: true`).
- **Impact**: Violates same-origin policy. Any malicious website can execute authenticated cross-site requests and steal sensitive customer data.
- **Recommended Fix**: Whitelist only trusted origins (production frontend URL, Vercel domain, and localhost in development).
- **Risk of Fix**: Low.

---

### SEC-007: Insecure JWT Fallback Secret & Non-Expiring Admin Tokens
- **Severity**: HIGH
- **Priority**: P1 (Fix Before Production)
- **Files**:
  - [`server/middweare/auth.js`](file:///d:/project-my/mens-weare/server/middweare/auth.js#L5)
  - [`server/controller/authController.js`](file:///d:/project-my/mens-weare/server/controller/authController.js#L201)
- **Problem**: JWT secret falls back to string `"secret"` if environment variable is unset. Admin tokens are signed without `expiresIn`.
- **Impact**: Token forgery if env fails; stolen admin tokens never expire.
- **Recommended Fix**: Throw error on startup if `JWT_SECRET` / `JWT_KEY` is not configured. Enforce token expiration (e.g. `1d` for admin, `7d` for user).
- **Risk of Fix**: Low.

---

### SEC-008: ReDoS / RegEx Injection in Product Search
- **Severity**: HIGH
- **Priority**: P1 (Fix Before Production)
- **File**: [`server/controller/productController.js`](file:///d:/project-my/mens-weare/server/controller/productController.js#L24-L32)
- **Problem**: Unsanitized user string passed to `new RegExp(search, "i")` and `$regex`.
- **Impact**: Attacker can provide catastrophic regex patterns causing Denial of Service for the entire Node.js server.
- **Recommended Fix**: Sanitize search input by escaping regex special characters (`search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`).
- **Risk of Fix**: Low.

---

### SEC-009: Missing Rate Limiting on Auth, Contact & Payments
- **Severity**: MEDIUM
- **Priority**: P1 (Fix Before Production)
- **Files**: `server/routes/authRoutes.js`, `server/routes/messageRoutes.js`, `server/routes/paymentRoutes.js`
- **Problem**: No rate limiting implemented.
- **Impact**: Susceptible to credential stuffing, password brute force, contact form spam, and payment order flood.
- **Recommended Fix**: Integrate `express-rate-limit` for `/api/auth/login`, `/api/auth/admin-login`, `/api/messages`, and `/api/payment/create-order`.
- **Risk of Fix**: Low.

---

### SEC-010: Missing Security Headers
- **Severity**: MEDIUM
- **Priority**: P2 (Fix Soon)
- **File**: [`server/index.js`](file:///d:/project-my/mens-weare/server/index.js)
- **Problem**: No HTTP security headers (Helmet) configured on Express.
- **Impact**: Missing basic defenses against clickjacking, MIME-type confusion, and XSS.
- **Recommended Fix**: Add `helmet` middleware.
- **Risk of Fix**: Low.

---

### SEC-011: Mass Assignment in Address & Profile Operations
- **Severity**: MEDIUM
- **Priority**: P2 (Fix Soon)
- **File**: [`server/controller/authController.js`](file:///d:/project-my/mens-weare/server/controller/authController.js#L140-L160)
- **Problem**: Direct assignment of `req.body` to address subdocuments without property whitelisting.
- **Impact**: Unintended fields stored in database documents.
- **Recommended Fix**: Whitelist allowed fields (`name`, `phone`, `addressLine1`, `addressLine2`, `city`, `state`, `pincode`, `isDefault`).
- **Risk of Fix**: Low.

---

### SEC-012: Critical/High Dependency Vulnerabilities
- **Severity**: HIGH
- **Priority**: P1 (Fix Before Production)
- **File**: `client/package.json`
- **Problem**: Next.js 16.2.12 has critical CVEs (GHSA-p293-qw3h-jr36: Remote Code Execution on Windows-hosted servers).
- **Impact**: Possible remote code execution.
- **Recommended Fix**: Safely update Next.js and sub-dependencies.
- **Risk of Fix**: Medium (requires testing build and routes).
