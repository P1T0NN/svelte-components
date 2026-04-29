// LIBRARIES
import * as v from 'valibot';

export const sendContactFormEmailSchema = v.object({
	name: v.pipe(v.string(), v.minLength(3, 'Name must be at least 3 characters')),
	email: v.pipe(v.string(), v.email('Please enter a valid email address')),
	message: v.pipe(v.string(), v.minLength(10, 'Message must be at least 10 characters'))
});

export type SendContactFormEmailSchema = v.InferOutput<typeof sendContactFormEmailSchema>;