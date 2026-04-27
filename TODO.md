# Auth production readiness

Work through these **one at a time**. Email, Resend, and `projectSettings` are out of scope for this list.

## P0 — Security / correctness

- [x] **Forgot-password anti-enumeration** — Always show the same “next step” after requesting a reset; do not reveal whether the email is registered. Log real outcomes server-side only.
- [x] **Sign-up neutral errors** — Replace copy that implies “account already exists” with a generic message so addresses cannot be enumerated.
- [ ] **Auth rate limiting** — Add per-email buckets for OTP send vs OTP verify (e.g. Password `profile()` + existing rate limiter). Convex Auth has some built-in limits; this adds an extra layer.
- [x] **Distinct Resend provider `id`s** — Ensure verify vs password-reset OTP providers use different `id` values so they do not collide in the Auth registry.
- [x] **Safe account linking** — Only link by email when the provider has proven ownership (e.g. vetted OAuth + post-OTP `verification`); avoid blind link-by-email for future providers.

## P1 — UX and clarity

- [x] **Resend code on login/signup verification** — Same affordance as password reset so users are not stuck if the first email is delayed.
- [x] **Resend cooldown** — Short client-side cooldown (e.g. 30s) after “Resend”, in addition to server limits.
- [x] **Password policy** — Beyond min length: e.g. `validatePasswordRequirements` + small common-password deny list.
- [x] **Password reset error mapping** — Distinguish wrong code vs weak password vs rate limit via stable server codes and mapped UI copy.
- [x] **Preserve fields on cancel** — After leaving the OTP step, keep email (and name on signup) instead of clearing the form.
- [ ] **Audit / observability** — Log auth successes and rate-limit hits where you have a `userId`; extend schema only if you need events without a user id.

## P2 — Polish

- [x] **Autofocus** — Primary field per step/form.
- [x] **Form variant duplication** — Later refactor: shared logic between `*-no-image` and `*-with-image` components.
- [x] **Dead state / naming** — Small cleanups in forms when touching those files.

## Suggested test pass

After changes, exercise:

- Password reset: happy path, wrong code, resend.
- Sign-up: verify flow, cancel/back, duplicate-email message stays neutral.
- Login: verify flow, cancel/back.
- Rate limits: rapid resend / wrong codes (expect throttling, sensible UX).
- If Google + password: linking behavior after linking rules are updated.
