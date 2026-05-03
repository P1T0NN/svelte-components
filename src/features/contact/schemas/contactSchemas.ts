// LIBRARIES
import * as v from 'valibot';

export const sendContactFormEmailSchema = v.object({
	name: v.pipe(v.string(), v.minLength(3, 'Name must be at least 3 characters')),
	email: v.pipe(v.string(), v.email('Please enter a valid email address')),
	message: v.pipe(v.string(), v.minLength(10, 'Message must be at least 10 characters')),
	// Honeypot — invisible field hidden from real users via CSS. Bots that
	// auto-fill every input will leave a non-empty value and get rejected.
	website: v.optional(v.literal(''))
});

export type SendContactFormEmailSchema = v.InferOutput<typeof sendContactFormEmailSchema>;