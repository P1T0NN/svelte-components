// TYPES
import type { FieldErrors } from '@/shared/types/types';

class ContactSectionClass {
	public fieldErrors = $state<FieldErrors>({});

	public contactInputs = $state({
		name: '',
		email: '',
		message: ''
	});

	clearInputs() {
		this.contactInputs = {
			name: '',
			email: '',
			message: ''
		};
		this.fieldErrors = {};
	}
}

export const contactSectionClass = new ContactSectionClass();
