// Backend-emitted message CODES → English text. This is the frontend's resolution table
// for `{ key, params }` descriptors the backend sends (it never sends rendered text — see
// `@/shared/features/validations`).
//
// Hardcoded rather than read from the paraglide catalog so NOTHING in the app imports
// `m`: a project that drops paraglide deletes its config, files and package, and this keeps
// working. Adding i18n back is the easy direction — swap the lookup below for the catalog.
//
// Keys mirror `messages/en.json`; `{param}` placeholders are filled by `formatMessage`.

export const BACKEND_MESSAGES: Record<string, string> = {
	'GenericMessages.PASSWORD_TOO_SHORT': 'Password must be at least {min} characters.',
	'GenericMessages.PASSWORD_TOO_LONG': 'Password is too long.',
	'GenericMessages.PASSWORD_TOO_COMMON':
		'That password is too common. Please choose a stronger one.',
	'GenericMessages.NO_ITEMS_PROVIDED': 'No items provided.',
	'GenericMessages.NO_MATCHING_ITEMS': 'No matching items found.',
	'GenericMessages.DATA_TABLE_DELETED_ALL': 'Deleted {count} item(s).',
	'GenericMessages.DATA_TABLE_DELETED_WITH_MISSING':
		'Deleted {count} item(s); {missing} were already gone.',
	'GenericMessages.STORAGE_DELETE_FAILED':
		"Couldn't delete the file from storage. Nothing was removed.",
	'GenericMessages.STORAGE_URL_UNAVAILABLE': "Couldn't resolve the file URL.",
	'GenericMessages.UPLOAD_SAVE_FAILED': 'Could not save the uploaded file. Please try again.',
	'GenericMessages.UPLOAD_URL_READY': 'Upload URL generated.',
	'GenericMessages.EMAIL_SENT_SUCCESSFULLY': 'Email sent successfully.',
	'GenericMessages.TEST_ROW_CREATED': 'Test row created.',
	'GenericMessages.YOU_NEED_TO_CORRECT_FORM_ERRORS': 'You need to correct form errors',
	'GenericMessages.BATCH_TOO_LARGE': 'Too many items in a single request (max {limit}).',
	'GenericMessages.FORBIDDEN': "You're not allowed to perform this action.",
	'GenericMessages.NOT_AUTHENTICATED': 'Please sign in to continue.',
	'GenericMessages.ADMIN_ACCESS_REQUIRED': 'This action requires admin privileges.',
	'GenericMessages.ADMIN_CANNOT_BE_DELETED': 'Admins can\'t be deleted. Demote to "user" first.',
	'GenericMessages.USER_NOT_FOUND': 'User not found.',
	'GenericMessages.USER_DELETED': 'User deleted.',
	'GenericMessages.USER_BANNED': 'User banned.',
	'GenericMessages.USER_UNBANNED': 'User unbanned.',
	'GenericMessages.USER_ROLE_UPDATED': 'User role updated.',
	'GenericMessages.SESSION_REVOKED': 'Session revoked.',
	'GenericMessages.ALL_SESSIONS_REVOKED': 'All sessions revoked.',
	'GenericMessages.TOO_MANY_REQUESTS': 'Too many requests. Please try again later.',
	'GenericMessages.TOO_MANY_REQUESTS_SECONDS': 'Too many requests. Try again in {seconds}s.',
	'GenericMessages.TOO_MANY_REQUESTS_MINUTES': 'Too many requests. Try again in {minutes} min.',
	'GenericMessages.UNEXPECTED_ERROR': 'An unexpected error occurred. Please try again.',
	'ValidationMessages.Default.required': 'This field is required.',
	'ValidationMessages.Default.invalidValue': 'Please enter a valid value.',
	'ValidationMessages.Default.notANumber': 'Please enter a number.',
	'ValidationMessages.Default.invalidDate': 'Please enter a valid date.',
	'ValidationMessages.Default.invalidEmail': 'Please enter a valid email address.',
	'ValidationMessages.Default.invalidUrl': 'Please enter a valid link.',
	'ValidationMessages.Default.invalidChoice': 'Please pick one of the available options.',
	'ValidationMessages.Default.textTooShort': 'Please enter at least {min} characters.',
	'ValidationMessages.Default.textTooLong': 'Please keep it under {max} characters.',
	'ValidationMessages.Default.tooFewItems': 'Please add at least {min}.',
	'ValidationMessages.Default.tooManyItems': 'Please add no more than {max}.',
	'ValidationMessages.Default.numberNotNegative': "This can't be a negative number.",
	'ValidationMessages.Default.numberTooSmall': 'Please enter {min} or more.',
	'ValidationMessages.Default.numberTooBig': 'Please enter {max} or less.',
	'ValidationMessages.Auth.codeFormat': 'Use the 8-digit code from your email.',
	'ValidationMessages.Auth.passwordTooCommon':
		'That password is too common. Please choose a stronger one.',
	'ValidationMessages.Auth.passwordsMustMatch': 'Passwords must match.'
};

/** Fill `{param}` placeholders. Unknown placeholders are left as-is (visible in dev). */
export function formatMessage(
	template: string,
	params?: Record<string, string | number | boolean>
): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (match, name) =>
		name in params ? String(params[name]) : match
	);
}
