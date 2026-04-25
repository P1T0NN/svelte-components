/** Shown after a successful “send code” — OTP + new password for this address. */
export type PasswordResetFormVerify = { email: string };

export type PasswordResetFormStep = 'forgot' | PasswordResetFormVerify;

/** Names of validatable inputs in the password-reset form. */
export type PasswordResetField = 'email' | 'code' | 'newPassword';
