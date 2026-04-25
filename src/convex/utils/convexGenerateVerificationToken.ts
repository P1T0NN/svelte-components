// LIBRARIES
import { type RandomReader, generateRandomString } from '@oslojs/crypto/random';

const ALPHABET = '0123456789';
const LENGTH = 8;

/** 8-digit numeric OTP for email verification (sign-in / sign-up) and password reset. */
export async function convexGenerateVerificationToken(): Promise<string> {
	const random: RandomReader = {
		read(bytes) {
			crypto.getRandomValues(bytes);
		}
	};

	return generateRandomString(random, ALPHABET, LENGTH);
}
