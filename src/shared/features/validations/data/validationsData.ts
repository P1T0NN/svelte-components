// The `ValidationMessages.Default.*` catalog keys the default zod error map emits.
// Texts live in `messages/en.json` under the same paths — add a key here, add its copy
// there, and `mapDefaultValidationErrors.ts` can start emitting it.

export const VALIDATION_MESSAGE_KEYS = {
	required: 'ValidationMessages.Default.required',
	invalidValue: 'ValidationMessages.Default.invalidValue',
	notANumber: 'ValidationMessages.Default.notANumber',
	invalidDate: 'ValidationMessages.Default.invalidDate',
	invalidEmail: 'ValidationMessages.Default.invalidEmail',
	invalidUrl: 'ValidationMessages.Default.invalidUrl',
	invalidChoice: 'ValidationMessages.Default.invalidChoice',
	textTooShort: 'ValidationMessages.Default.textTooShort',
	textTooLong: 'ValidationMessages.Default.textTooLong',
	tooFewItems: 'ValidationMessages.Default.tooFewItems',
	tooManyItems: 'ValidationMessages.Default.tooManyItems',
	numberNotNegative: 'ValidationMessages.Default.numberNotNegative',
	numberTooSmall: 'ValidationMessages.Default.numberTooSmall',
	numberTooBig: 'ValidationMessages.Default.numberTooBig'
} as const;
