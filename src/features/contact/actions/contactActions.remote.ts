// SVELTEKIT IMPORTS
import { RESEND_API_KEY } from '$env/static/private';
import { command } from '$app/server';

// LIBRARIES
import { Resend } from 'resend';

// CONFIG
import { COMPANY_DATA } from '@/shared/constants';

// SCHEMAS
import { sendContactFormEmailSchema } from '@/features/contact/schemas/contactSchemas';

const resend = new Resend(RESEND_API_KEY);

export const sendContactFormEmail = command(
    sendContactFormEmailSchema,
    async (data) => {
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
			return {
                success: false,
                message: error.message,
                data: null,
            }
		}

		return {
            success: true,
            message: 'Email sent successfully',
            data: null,
        }
    }
);
