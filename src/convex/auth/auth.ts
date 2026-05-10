// LIBRARIES
import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { components } from '../_generated/api';
import type { DataModel } from '../_generated/dataModel';
import { betterAuth, type BetterAuthOptions } from 'better-auth/minimal';
import { emailOTP } from 'better-auth/plugins';
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
		// Tell better-auth where to read the real client IP from. The default checks
		// a generic header list and ends up logging Vercel's edge IP in our setup.
		// Vercel sets `x-forwarded-for` with the original client IP as the first
		// entry (and `x-real-ip` as a single-value mirror); read those and ignore
		// anything else. Order matters — better-auth uses the first header it
		// finds, so list `x-forwarded-for` first since it's the canonical one.
		// On non-Vercel hosts swap these for whatever header your edge sets
		// (`cf-connecting-ip` for Cloudflare, `true-client-ip` for Akamai, etc.).
		advanced: {
			ipAddress: {
				ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
				disableIpTracking: false
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
			convex({ authConfig })
		]
	} satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	return betterAuth(createAuthOptions(ctx));
};
