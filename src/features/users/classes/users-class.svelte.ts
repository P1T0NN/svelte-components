// TYPES
import type { Doc } from '@/convex/_generated/dataModel';

class UsersClass {
	currentUser = $state<Doc<'users'> | null | undefined>(undefined);
	
	/** True while `getCurrentUser` is in flight (not skipped), or until layout sync runs. */
	userLoading = $state(true);

	/** Call from the layout `useQuery` effect so all consumers share one subscription. */
	syncFromCurrentUserQuery(user: Doc<'users'> | null | undefined, loading: boolean) {
		this.currentUser = user;
		this.userLoading = loading;
	}
}

export const usersClass = new UsersClass();
