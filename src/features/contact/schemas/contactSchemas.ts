// LIBRARIES
import { z } from 'zod';

// No message strings: the default validation map (@/shared/features/validations) turns
// these into human, localized copy — min(3) → "Please enter at least 3 characters.", the
// email pipe → "Please enter a valid email address."
export const sendContactFormEmailSchema = z.object({
	name: z.string().min(3),
	email: z.string().trim().pipe(z.email()),
	message: z.string().min(10),
	// Honeypot — invisible field hidden from real users via CSS. Bots that
	// auto-fill every input will leave a non-empty value and get rejected.
	website: z.literal('').optional()
});

export type SendContactFormEmailSchema = z.infer<typeof sendContactFormEmailSchema>;
