# Security Specification for Brandavox AI

## 1. Data Invariants
- A `Lead` cannot be created without a valid owner (`ownerId` matching `request.auth.uid`).
- `Invoice` documents are strictly read-only for the client and writeable only by the agency owner.
- `Presence` data must be updated by the current user only.
- `EmailCampaigns` must preserve `ownerId` on updates.
- `AITrends` are globally readable but only system-writeable.

## 2. The "Dirty Dozen" Payloads (Red Team Tests)

1. **Identity Spoofing**: Attempt to create a `Lead` with a different `ownerId`.
2. **Privilege Escalation**: Attempt to update `User.role` to 'owner' as a standard user.
3. **Orphaned Writes**: Create a `Message` in a `Chat` that the user is not a participant of.
4. **Action Gap**: Update an `Invoice` status from 'pending' to 'paid' without being an admin.
5. **Shadow Update**: Add a `secretField` to a `Post` document.
6. **Denial of Wallet**: Injected a 1MB string into a `Lead.email` field.
7. **Cross-Tenant Access**: Read `Client` data belonging to another agency.
8. **Immutability Breach**: Change `Post.authorId` after creation.
9. **Temporal Scam**: Set `Post.createdAt` to a future date from the client.
10. **Query Scrape**: Attempt to list all `Users` without a filter on `uid`.
11. **Social Account Poisoning**: Update `SocialAccount.followers` to 1,000,000 manually.
12. **Chat Injection**: Read messages in a `Chat` the user doesn't belong to.

## 3. Test Runner (Draft)
A comprehensive `firestore.rules.test.ts` will verify these cases.
