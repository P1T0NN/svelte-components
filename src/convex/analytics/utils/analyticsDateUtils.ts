export const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfUtcDay(timestamp: number) {
	const date = new Date(timestamp);
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function addUtcDays(timestamp: number, days: number) {
	return timestamp + days * DAY_MS;
}

export function listDailyBuckets(from: number, to: number) {
	const start = startOfUtcDay(from);
	const end = startOfUtcDay(to);
	const buckets: number[] = [];

	for (let bucket = start; bucket <= end; bucket = addUtcDays(bucket, 1)) {
		buckets.push(bucket);
	}

	return buckets;
}
