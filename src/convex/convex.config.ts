// LIBRARIES
import { defineApp } from 'convex/server';
import rateLimiter from '@convex-dev/rate-limiter/convex.config.js';
import r2 from '@convex-dev/r2/convex.config.js';
import aggregate from '@convex-dev/aggregate/convex.config.js';
import analytics from '@piton-/analytics-convex/convex.config.js';
import betterAuth from './auth/component/convex.config';

const app = defineApp();
app.use(rateLimiter);
app.use(betterAuth);
app.use(r2);
app.use(analytics);

// One component instance per aggregate (each is its own B-tree). Register a new one here
// for every offset-paginated surface that needs exact totals at scale, then define its
// `TableAggregate` + trigger in `aggregates.ts`. Naming: aggregate<Table>[<Purpose>].
app.use(aggregate, { name: 'aggregateTestRows' });

export default app;
