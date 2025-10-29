# CarrierSignal Security Hardening Guide

## Overview

This guide covers security best practices, hardening strategies, and compliance measures for CarrierSignal.

## Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Minimal necessary permissions
3. **Zero Trust**: Verify everything, trust nothing
4. **Secure by Default**: Security-first design
5. **Continuous Monitoring**: Detect and respond to threats

## Frontend Security

### 1. Input Validation & Sanitization

```typescript
// src/utils/validation.ts
import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
  });
}

// Usage
const userInput = sanitizeInput(userProvidedText);
const articleHTML = sanitizeHTML(articleContent);
```

### 2. XSS Prevention

```typescript
// React automatically escapes text content
<div>{userInput}</div> // Safe - automatically escaped

// Use dangerouslySetInnerHTML only with sanitized content
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }} />

// Avoid eval and Function constructor
// ❌ Bad
eval(userCode);
new Function(userCode)();

// ✅ Good
// Use Web Workers or sandboxed iframes for untrusted code
```

### 3. CSRF Protection

```typescript
// Firebase Auth handles CSRF tokens automatically
// For custom endpoints, include CSRF token in headers

export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken || '',
    },
  });
}
```

### 4. Content Security Policy

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://firebaseio.com https://openai.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  "
/>
```

### 5. Secure Headers

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
});
```

## Backend Security

### 1. Firebase Security Rules

```typescript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Articles collection - public read, authenticated write
    match /articles/{document=**} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
    }

    // Bookmarks collection - user-specific
    match /bookmarks/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }

    // User preferences - user-specific
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### 2. Input Validation with Zod

```typescript
// functions/src/schemas.ts
import { z } from 'zod';

export const ArticleSchema = z.object({
  url: z.string().url('Invalid URL'),
  title: z.string().min(1).max(500),
  description: z.string().max(2000),
  source: z.string().min(1).max(100),
  publishedAt: z.string().datetime(),
  smartScore: z.number().min(0).max(100),
  tags: z.object({
    lob: z.array(z.string()).max(10),
    perils: z.array(z.string()).max(10),
    regions: z.array(z.string()).max(10),
  }),
});

// Validate before processing
export function validateArticle(data: unknown): Article {
  return ArticleSchema.parse(data);
}
```

### 3. Rate Limiting

```typescript
// functions/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
});

// Usage
app.post('/api/articles', apiLimiter, handleArticles);
app.post('/auth/login', authLimiter, handleLogin);
```

### 4. Environment Variables

```bash
# .env.local (never commit)
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx

# functions/.env (never commit)
OPENAI_API_KEY=xxx
FIREBASE_ADMIN_SDK_KEY=xxx
```

### 5. Secrets Management

```typescript
// Use Firebase Secret Manager
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getSecret(secretId: string): Promise<string> {
  const client = new SecretManagerServiceClient();
  const name = client.secretVersionPath(process.env.GCP_PROJECT_ID!, secretId, 'latest');
  const [version] = await client.accessSecretVersion({ name });
  return version.payload?.data?.toString() || '';
}
```

## API Security

### 1. Authentication

```typescript
// Verify Firebase ID token
import * as admin from 'firebase-admin';

export async function verifyAuth(req: Request): Promise<string> {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) throw new Error('No token provided');

  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid;
}
```

### 2. Authorization

```typescript
// Check user permissions
export async function checkPermission(userId: string, resource: string): Promise<boolean> {
  const user = await admin.firestore().collection('users').doc(userId).get();
  const permissions = user.data()?.permissions || [];
  return permissions.includes(resource);
}
```

### 3. API Key Rotation

```typescript
// Rotate API keys regularly
export async function rotateApiKey(userId: string): Promise<string> {
  const newKey = generateSecureKey();
  await admin.firestore().collection('users').doc(userId).update({
    apiKey: newKey,
    apiKeyRotatedAt: new Date(),
  });
  return newKey;
}
```

## Data Protection

### 1. Encryption at Rest

```typescript
// Firestore automatically encrypts data at rest
// For sensitive fields, use application-level encryption

import crypto from 'crypto';

export function encryptField(value: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptField(encrypted: string, key: string): string {
  const [iv, authTag, ciphertext] = encrypted.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key),
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 2. Encryption in Transit

```typescript
// Always use HTTPS
// Firebase automatically enforces HTTPS
// Configure HSTS headers

app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### 3. Data Retention

```typescript
// Implement data retention policies
export async function deleteOldArticles(daysOld: number): Promise<void> {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  const snapshot = await admin
    .firestore()
    .collection('articles')
    .where('publishedAt', '<', cutoffDate)
    .get();

  const batch = admin.firestore().batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
```

## Monitoring & Logging

### 1. Security Logging

```typescript
// Log security events
export function logSecurityEvent(
  event: string,
  userId: string,
  details: Record<string, unknown>
): void {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    userId,
    details,
    severity: 'INFO',
  }));
}

// Usage
logSecurityEvent('login_attempt', userId, { ip, userAgent });
logSecurityEvent('unauthorized_access', userId, { resource });
```

### 2. Error Handling

```typescript
// Don't expose sensitive information in errors
export function handleError(error: Error): Response {
  console.error('Internal error:', error);

  return {
    success: false,
    message: 'An error occurred',
    // Don't include error details in response
  };
}
```

## Compliance

### 1. GDPR Compliance

```typescript
// Right to be forgotten
export async function deleteUserData(userId: string): Promise<void> {
  // Delete user account
  await admin.auth().deleteUser(userId);

  // Delete user data
  await admin.firestore().collection('users').doc(userId).delete();

  // Delete bookmarks
  const bookmarks = await admin
    .firestore()
    .collection('bookmarks')
    .where('userId', '==', userId)
    .get();

  const batch = admin.firestore().batch();
  bookmarks.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}
```

### 2. Data Privacy

```typescript
// Privacy policy and terms of service
// Implement consent management
// Provide data export functionality

export async function exportUserData(userId: string): Promise<string> {
  const user = await admin.firestore().collection('users').doc(userId).get();
  const bookmarks = await admin
    .firestore()
    .collection('bookmarks')
    .where('userId', '==', userId)
    .get();

  return JSON.stringify({
    user: user.data(),
    bookmarks: bookmarks.docs.map(doc => doc.data()),
  });
}
```

## Security Checklist

- [ ] All inputs validated and sanitized
- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] Firebase Security Rules implemented
- [ ] Rate limiting enabled
- [ ] API authentication required
- [ ] Secrets managed securely
- [ ] Logging and monitoring active
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented
- [ ] GDPR compliance verified
- [ ] Dependencies kept up to date

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security](https://firebase.google.com/docs/security)
- [React Security](https://react.dev/learn/security)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)

