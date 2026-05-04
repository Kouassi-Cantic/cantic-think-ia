# Security Specification For Club Jeunes (V2.0)

## 1. Data Invariants
- Posts can only be created by authenticated users.
- Victories can only be created by authenticated users.
- Admin analysis on posts can only be performed by Admins.
- Users can only edit/delete their own posts/victories.

## 2. Dirty Dozen Payloads (Security Tests)
1. Unauthorized write to `forum_posts` (anonymous).
2. Unauthorized update to `forum_posts` (not author/not admin).
3. Shadow field injection to `forum_posts` (e.g., `isVerified: true`).
4. Large ID injection (Denial of Wallet).
5. Unauthorized write to `victories` (anonymous).
6. Unauthorized update to `victories` (not author).
7. Admin action on `forum_posts` by non-admin.
8. PII leak attempt on `victories` (non-owner).
9. Spoofed email in `request.auth.token` (email_verified check).
10. Orphaned write `forum_comments` (missing postId).
11. Type mismatch (Post content as integer).
12. Terminal state write attempt (analyzed post modified).

## 3. Test Runner (firestore.rules)
- Implement `rules_version = '2';`
- Implement proper `isValidId`, `isValidPost`, `isValidVictory`, `isValidComment`, `isValidAdmins`
- Default deny: `match /{document=**} { allow read, write: if false; }`
