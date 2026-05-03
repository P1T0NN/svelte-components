// SVELTEKIT IMPORTS
import { RESEND_API_KEY } from '$env/static/private';

// LIBRARIES
import { Resend } from 'resend';
import { m } from '@/shared/lib/paraglide/messages';

// CONFIG
import { COMPANY_DATA } from '@/shared/constants';

// UTILS
import { safeCommand } from '@/shared/utils/remoteFunctionsUtils';

// SCHEMAS
import { sendContactFormEmailSchema } from '@/features/contact/schemas/contactSchemas';

export const sendContactFormEmail = safeCommand(sendContactFormEmailSchema, async (data) => {
	const resend = new Resend(RESEND_API_KEY);
	
	const { error } = await resend.emails.send({
		from: `Website Contact Form <noreply@${COMPANY_DATA.DOMAIN}>`,
		to: [COMPANY_DATA.EMAIL],
		subject: 'Website contact form',
		html: `
			<p>Name: ${data.name}</p>
			<p>Email: ${data.email}</p>
			<p>Message: ${data.message}</p>
		`
	});

	if (error) {
		return { success: false, message: error.message, data: null };
	}

	return { success: true, message: m['GenericMessages.EMAIL_SENT_SUCCESSFULLY'](), data: null };
});
