// CONFIG
import { analyticsEventRegistry } from '../analyticsConfigs';

// TYPES
import type {
	AnalyticsEventConfig,
	AnalyticsEventName,
	AnalyticsProperties,
	AnalyticsPropertyType
} from '../types/analyticsTypes';

export function sanitizeAnalyticsProperties(input: Record<string, unknown> | undefined) {
	const properties: AnalyticsProperties = {};

	for (const [key, value] of Object.entries(input ?? {})) {
		if (value === undefined) continue;

		if (
			value === null ||
			typeof value === 'string' ||
			typeof value === 'number' ||
			typeof value === 'boolean'
		) {
			properties[key] = value;
		}
	}

	return properties;
}

export function validateAnalyticsEventInput(
	name: AnalyticsEventName,
	properties: AnalyticsProperties
) {
	const config = analyticsEventRegistry[name] as AnalyticsEventConfig | undefined;
	const errors: string[] = [];

	if (!config) {
		return [`Unknown analytics event "${name}".`];
	}

	const propertyTypes = (config.properties ?? {}) as Record<string, AnalyticsPropertyType>;

	for (const key of config.requiredProperties ?? []) {
		if (properties[key] === undefined || properties[key] === null) {
			errors.push(`Missing required property "${key}" for analytics event "${name}".`);
		}
	}

	for (const [key, value] of Object.entries(properties)) {
		const expectedType = propertyTypes[key];

		if (!expectedType) {
			errors.push(`Property "${key}" is not registered for analytics event "${name}".`);
			continue;
		}

		if (value !== null && typeof value !== expectedType) {
			errors.push(
				`Property "${key}" for analytics event "${name}" must be ${expectedType}; received ${typeof value}.`
			);
		}
	}

	return errors;
}
