// TYPES
import type { FieldErrors } from '@/shared/features/validations/types/validationsTypes';

class ContactSectionClass {
	public fieldErrors = $state<FieldErrors>({});

	public contactInputs = $state({
		name: '',
		email: '',
		message: '',
		/** Honeypot — must remain empty. Hidden from real users via CSS. */
		website: ''
	});

	clearInputs() {
		this.contactInputs = {
			name: '',
			email: '',
			message: '',
			website: ''
		};
		this.fieldErrors = {};
	}
}

export const contactSectionClass = new ContactSectionClass();
