<script lang="ts">
	// LIBRARIES
	import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';

	// COMPONENTS
	import Calendar from '@/components/ui/calendar/calendar.svelte';
	import * as Popover from '@/components/ui/popover/index.js';
	import { Button } from '@/components/ui/button/index.js';
	import { Label } from '@/components/ui/label/index.js';

	// LUCIDE ICONS
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import TimeInput from '../time-input/time-input.svelte';

	const id = $props.id();

	let open = $state(false);
	let value = $state<CalendarDate | undefined>();
</script>

<div class="flex gap-4">
	<div class="flex flex-col gap-3">
		<Label for="{id}-date" class="px-1">Date</Label>

		<Popover.Root bind:open>
			<Popover.Trigger id="{id}-date">
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="w-32 justify-between font-normal">
						{value ? value.toDate(getLocalTimeZone()).toLocaleDateString() : 'Select date'}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>

			<Popover.Content class="w-auto overflow-hidden p-0" align="start">
				<Calendar
					type="single"
					bind:value
					onValueChange={() => {
						open = false;
					}}
					captionLayout="dropdown"
				/>
			</Popover.Content>
		</Popover.Root>
	</div>

	<div class="flex flex-col gap-3">
		<Label for="{id}-time" class="px-1">Time</Label>

		<TimeInput {id} />
	</div>
</div>
