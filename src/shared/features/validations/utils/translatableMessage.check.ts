// ponytail: self-check instead of a test framework —
// `bun run src/shared/features/validations/utils/translatableMessage.check.ts`
//
// Separate file on purpose: the module under test is dual-runtime, and Convex's analyzer
// rejects `import.meta` in anything it bundles. Nothing imports this file, so Convex never
// sees it. Same reason applies to any future check for a `src/shared/**` module.

import {
	hasTranslatableMessage,
	parseTranslatableMessage,
	rateLimitDescriptor
} from './translatableMessage.js';

const eq = (actual: unknown, expected: unknown, label: string) => {
	const [a, b] = [JSON.stringify(actual), JSON.stringify(expected)];
	if (a !== b) throw new Error(`${label}: got ${a}, want ${b}`);
};

eq(hasTranslatableMessage({ message: { key: 'x' } }), true, 'guard: descriptor');
eq(hasTranslatableMessage({ message: 'plain' }), false, 'guard: string message');
eq(hasTranslatableMessage(null), false, 'guard: null');
eq(hasTranslatableMessage('nope'), false, 'guard: non-object');

// round-trips with the JSON.stringify used at the two encode sites
const d = { key: 'a.b', params: { n: 1 } };
eq(parseTranslatableMessage(JSON.stringify(d)), d, 'parse: round-trip');
eq(parseTranslatableMessage('Passwords must match.'), null, 'parse: human text');
eq(parseTranslatableMessage('{oops'), null, 'parse: malformed JSON');
eq(parseTranslatableMessage('{"key":123}'), null, 'parse: non-string key');
eq(parseTranslatableMessage('null'), null, 'parse: JSON null');

eq(rateLimitDescriptor(), { key: 'GenericMessages.TOO_MANY_REQUESTS' }, 'rate: no retryAfter');
eq(rateLimitDescriptor(1_500).params, { seconds: 2 }, 'rate: seconds rounds up');
eq(rateLimitDescriptor(90_000).params, { minutes: 2 }, 'rate: minutes rounds up');

console.log('translatableMessage: ok');
