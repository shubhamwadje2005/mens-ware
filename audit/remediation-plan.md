# Remediation Plan

**Project**: Maitri Men's Wear (Noir Studio)  
**Execution Order**: High-to-Low Severity, Zero Regression, Step-by-Step Testing  

---

## Remediation Sequence

### Stage 1: Critical Security (P0)
1. **Fix SEC-001 (IDOR in Order Retrieval)**:
   - File: `server/controller/orderController.js` (`getOrderById`)
   - Add ownership check (`order.user === req.user._id` OR `req.user.role === 'admin'`).
2. **Fix SEC-002 (Client-Controlled Pricing)**:
   - File: `server/controller/orderController.js` (`createOrder`)
   - Recompute prices from database `Product` and variant prices on the server.
3. **Fix SEC-003 (Unverified Payment Status Bypass)**:
   - File: `server/controller/orderController.js` (`createOrder`)
   - Ensure online orders are set to `"pending"` until validated in `verifyPayment`.
4. **Fix SEC-004 (Hardcoded Credentials & Personal Emails)**:
   - Files: `client/src/app/admin/login/page.tsx`, `client/src/context/AuthContext.tsx`, `server/middweare/auth.js`
   - Remove commented credentials and hardcoded email bypasses.

---

### Stage 2: High Security (P1)
5. **Fix SEC-005 (Plaintext Password Storage in LocalStorage)**:
   - File: `client/src/context/AuthContext.tsx`
   - Remove `noir-user-pwd` and `noir-users` storage logic. Passwords must never be saved locally.
6. **Fix SEC-006 (Permissive CORS)**:
   - File: `server/index.js`
   - Whitelist exact origins: `process.env.FRONTEND_URL`, `https://client-mens-ware.vercel.app`, and `localhost` in dev.
7. **Fix SEC-007 (Insecure JWT Fallback & Admin Expiry)**:
   - Files: `server/middweare/auth.js`, `server/controller/authController.js`
   - Require `JWT_SECRET` / `JWT_KEY`. Enforce expiration (`expiresIn: "1d"` on admin token).
8. **Fix SEC-008 (ReDoS / RegEx Injection)**:
   - File: `server/controller/productController.js`
   - Sanitize and escape regex special characters before passing to MongoDB.

---

### Stage 3: Medium Security & High-Impact Performance (P1/P2)
9. **Fix SEC-009 (Rate Limiting)**:
   - Install and configure `express-rate-limit` for authentication, contact, and payment creation routes.
10. **Fix SEC-010 (Security Headers)**:
    - Install and configure `helmet` in `server/index.js`.
11. **Fix SEC-011 (Mass Assignment in Address Operations)**:
    - Whitelist address fields in `authController.js` (`name`, `phone`, `addressLine1`, `addressLine2`, `city`, `state`, `pincode`, `isDefault`).
12. **Fix PERF-001 (MongoDB Compound Indexes)**:
    - Add compound indexes to `Product.js`, `Order.js`, `Message.js` for fast filtered sorting.
13. **Fix PERF-004 (HTTP Response Compression)**:
    - Add `compression` middleware to Express server.
14. **Fix PERF-003 (Cascading Re-renders in React Contexts)**:
    - Refactor `ThemeContext`, `CartContext`, `WishlistContext` to lazy initializers.

---

## Verification & Regression Testing Strategy
- After each stage, verify:
  1. `npm run build` on `client` (ensure 0 TypeScript / compilation errors).
  2. Local server test (`curl.exe` to check health, auth, orders, products).
  3. Security assertions (test IDOR access denied, test price calculation, test CORS reflection rejected for untrusted origins).
