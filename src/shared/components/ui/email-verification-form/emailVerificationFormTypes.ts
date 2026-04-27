/** Names of validatable inputs in the email-verification form. */
export type EmailVerificationField = 'code';

/** What to send when the user taps “Resend” (Convex Auth Password provider). */
export type EmailVerificationResendConfig =
	| {
			flow: 'signIn';
			email: string;
			password: string;
			/** If the library completes sign-in without OTP (edge case), run success flow. */
			onSignedIn?: () => void | Promise<void>;
	  }
	| {
			flow: 'signUp';
			name: string;
			email: string;
			password: string;
			onSignedIn?: () => void | Promise<void>;
	  }
	| {
			flow: 'reset';
			email: string;
	  };
