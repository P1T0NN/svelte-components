<script lang="ts">
	// COMPONENTS — custom calendar demos
	import ChartFilter from '@/shared/components/ui/custom-calendars/chart-filter.svelte';
	import CustomDaysAndFormatters from '@/shared/components/ui/custom-calendars/custom-days-and-formatters.svelte';
	import LocalizedCalendar from '@/shared/components/ui/custom-calendars/localized-calendar.svelte';
	import MultipleMonthsWithRangeSelection from '@/shared/components/ui/custom-calendars/multiple-months-with-range-selection.svelte';
	import WithBookedUnavailableDays from '@/shared/components/ui/custom-calendars/with-booked-unavailable-days.svelte';
	import WithDisabledDays from '@/shared/components/ui/custom-calendars/with-disabled-days.svelte';
	import WithDisabledWeekends from '@/shared/components/ui/custom-calendars/with-disabled-weekends.svelte';
	import WithEventSlots from '@/shared/components/ui/custom-calendars/with-event-slots.svelte';
	import WithMinAndMaxDays from '@/shared/components/ui/custom-calendars/with-min-and-max-days.svelte';
	import WithTime from '@/shared/components/ui/custom-calendars/with-time.svelte';

	// COMPONENTS — pickers & layout
	import DatePicker from '@/shared/components/ui/date-picker/date-picker.svelte';
	import DateAndTimePicker from '@/shared/components/ui/date-picker/date-and-time-picker.svelte';
	import DatePickerWithInput from '@/shared/components/ui/date-picker/date-picker-with-input.svelte';
	import Section from '@/shared/components/ui/section/section.svelte';
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-16">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Calendar demos</h1>
		<p class="text-muted-foreground text-sm">
			Examples from <code class="rounded bg-muted px-1 py-0.5 text-xs">custom-calendars</code> plus
			base date pickers.
		</p>
	</header>

	<section
		class="flex w-full min-w-0 flex-col gap-4 self-stretch"
		aria-labelledby="demo-chart-filter"
	>
		<h2 id="demo-chart-filter" class="text-lg font-semibold">Chart filter</h2>
		<p class="text-muted-foreground text-sm">Range calendar driving a bar chart (layerchart).</p>
		<div class="min-w-0 overflow-x-auto">
			<ChartFilter />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-4" aria-labelledby="demo-custom-days">
		<h2 id="demo-custom-days" class="text-lg font-semibold">Custom days and formatters</h2>
		<p class="text-muted-foreground text-sm">Custom day cells with weekend pricing.</p>
		<div class="w-fit max-w-full overflow-x-auto">
			<CustomDaysAndFormatters />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-4" aria-labelledby="demo-localized">
		<h2 id="demo-localized" class="text-lg font-semibold">Localized calendar</h2>
		<p class="text-muted-foreground text-sm">Range calendar with locale selector (Paraglide).</p>
		<div class="w-fit max-w-full overflow-x-auto">
			<LocalizedCalendar />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-4" aria-labelledby="demo-multi-month-range">
		<h2 id="demo-multi-month-range" class="text-lg font-semibold">Multiple months with range</h2>
		<p class="text-muted-foreground text-sm">Two-month range selection.</p>
		<div class="w-fit max-w-full overflow-x-auto">
			<MultipleMonthsWithRangeSelection />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-4" aria-labelledby="demo-booked-unavailable">
		<h2 id="demo-booked-unavailable" class="text-lg font-semibold">Booked / unavailable days</h2>
		<p class="text-muted-foreground text-sm">Single date with unavailable dates strikethrough.</p>
		<div class="w-fit max-w-full overflow-x-auto">
			<WithBookedUnavailableDays />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-4" aria-labelledby="demo-min-value">
		<h2 id="demo-min-value" class="text-lg font-semibold">Minimum date</h2>
		<p class="text-muted-foreground text-sm">Days before a minimum are disabled.</p>
		<div class="w-fit max-w-full overflow-x-auto">
			<WithDisabledDays />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-4" aria-labelledby="demo-disabled-weekends">
		<h2 id="demo-disabled-weekends" class="text-lg font-semibold">Disabled weekends</h2>
		<p class="text-muted-foreground text-sm">Range with weekends excluded from selection.</p>
		<div class="w-fit max-w-full overflow-x-auto">
			<WithDisabledWeekends />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-4" aria-labelledby="demo-event-slots">
		<h2 id="demo-event-slots" class="text-lg font-semibold">Event slots</h2>
		<p class="text-muted-foreground text-sm">Single day with a list of events for that date.</p>
		<div class="w-fit max-w-full overflow-x-auto">
			<WithEventSlots />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-4" aria-labelledby="demo-min-max-nights">
		<h2 id="demo-min-max-nights" class="text-lg font-semibold">Min / max stay length</h2>
		<p class="text-muted-foreground text-sm">Range limited by <code class="text-xs">minDays</code> / <code class="text-xs">maxDays</code>.</p>
		<div class="w-fit max-w-full overflow-x-auto">
			<WithMinAndMaxDays />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-4" aria-labelledby="demo-with-time">
		<h2 id="demo-with-time" class="text-lg font-semibold">Date with time slots</h2>
		<p class="text-muted-foreground text-sm">Calendar plus scrollable time buttons.</p>
		<div class="w-fit max-w-full overflow-x-auto">
			<WithTime />
		</div>
	</section>

	<section class="flex max-w-full flex-col gap-6 border-t pt-12" aria-labelledby="demo-base-pickers">
		<h2 id="demo-base-pickers" class="text-lg font-semibold">Date picker components</h2>
		<div class="flex w-fit max-w-full flex-col gap-4 sm:gap-6">
			<DatePicker />
			<DateAndTimePicker />
			<DatePickerWithInput />
		</div>
	</section>
</Section>
