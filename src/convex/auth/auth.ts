// LIBRARIES
import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { components } from '../_generated/api';
import type { DataModel } from '../_generated/dataModel';
import { betterAuth, type BetterAuthOptions } from 'better-auth/minimal';
import { admin, emailOTP } from 'better-auth/plugins';
import authConfig from './auth.config';
import { sendVerificationOTP } from './emails/sendVerificationOTP';
import authSchema from './component/schema';

export const authComponent = createClient<DataModel, typeof authSchema>(components.betterAuth, {
	local: {
		schema: authSchema
	}
});

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
	return {
		baseURL: process.env.SITE_URL,
		database: authComponent.adapter(ctx),
		user: {
			additionalFields: {
				role: {
					type: 'string',
					required: true,
					defaultValue: 'user',
					// Block clients from setting role via signUp/updateUser — only
					// trusted server code can change it.
					input: false
				}
			}
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			minPasswordLength: 8,
			maxPasswordLength: 128
		},
		// BA keys rate limits per-IP for unauthenticated routes and per-user for
		// authenticated routes (stored in the `rateLimit` table). The customRules
		// below tighten the most-abused endpoints; the global window/max catches
		// everything else.
		rateLimit: {
			enabled: true,
			storage: 'database',
			window: 60,
			max: 100,
			customRules: {
				// Credential auth — brute-force surface
				'/sign-in/email': { window: 60, max: 5 },
				'/sign-up/email': { window: 60, max: 3 },
				// OTP send is the costliest endpoint (sends real email); throttle hard
				'/email-otp/send-verification-otp': { window: 60, max: 2 },
				'/email-otp/verify-email': { window: 60, max: 5 },
				// Password reset — same shape as sign-in
				'/email-otp/request-password-reset': { window: 60, max: 3 },
				'/reset-password': { window: 60, max: 5 },
				// OAuth start; cheap but still gate against open-redirect probing
				'/sign-in/social': { window: 60, max: 10 }
			}
		},
		account: {
			accountLinking: {
				enabled: true,
				trustedProviders: ['google', 'credential']
			}
		},
		// Real client IP is delivered to us via our SvelteKit auth proxy under the
		// custom header `x-client-ip` (see `routes/api/auth/[...all]/+server.ts`).
		// We must use a custom name — not `x-forwarded-for` or `cf-connecting-ip`
		// — because Convex sits behind Cloudflare, which rewrites the well-known
		// IP headers to the immediate caller's IP (Vercel's egress) before
		// better-auth ever sees them.
		//
		// Trust: our proxy strips all inbound headers and re-stamps `x-client-ip`
		// from `event.getClientAddress()`, which on Vercel reads the trusted
		// edge-set `x-forwarded-for`. The chain has no client-controlled link.
		//
		// Fallback to `cf-connecting-ip`: better-auth tries headers in order and
		// returns the first hit. User-driven requests resolve via `x-client-ip`
		// (correct, real client). Server-to-server requests that bypass our proxy
		// (e.g. internal JWKs fetches at `/api/auth/convex/jwks`) lack
		// `x-client-ip`, so without a fallback better-auth would skip rate
		// limiting and emit a WARN per call. `cf-connecting-ip` is set by
		// Cloudflare on every request reaching Convex; for those internal calls
		// it's the immediate caller's IP (Vercel egress), which is fine for
		// rate-limit bucketing on a public endpoint.
		advanced: {
			ipAddress: {
				ipAddressHeaders: ['x-client-ip', 'cf-connecting-ip']
			}
		},
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!
			}
		},
		plugins: [
			emailOTP({
				otpLength: 8,
				sendVerificationOnSignUp: true,
				sendVerificationOTP
			}),
			admin({
				defaultRole: 'user',
				adminRoles: ['admin']
			}),
			convex({ authConfig })
		]
	} satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	return betterAuth(createAuthOptions(ctx));
};
