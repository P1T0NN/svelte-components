// LIBRARIES
import Resend from '@auth/core/providers/resend';
import { Resend as ResendAPI } from 'resend';

// CONFIG
import { CONVEX_PROJECT_SETTINGS } from '../../projectSettings';

// UTILS
import { convexGenerateVerificationToken } from '../utils/convexGenerateVerificationToken.js';

export const ResendOTP = Resend({
	id: 'resend-otp-verify',
	apiKey: process.env.AUTH_RESEND_KEY,
	generateVerificationToken: convexGenerateVerificationToken,
	async sendVerificationRequest({ identifier: email, provider, token }) {
		const resend = new ResendAPI(provider.apiKey);

		const { error } = await resend.emails.send({
			from: `${CONVEX_PROJECT_SETTINGS.NAME} <${CONVEX_PROJECT_SETTINGS.RESEND_EMAIL}>`,
			to: [email],
			subject: `Sign in to ${CONVEX_PROJECT_SETTINGS.NAME}`,
			text: 'Your code is ' + token
		});

		if (error) {
			throw new Error('Could not send');
		}
	}
});
