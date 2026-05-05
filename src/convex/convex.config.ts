// LIBRARIES
import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import r2 from "@convex-dev/r2/convex.config.js";
import betterAuth from './auth/component/convex.config';

const app = defineApp();
app.use(rateLimiter);
app.use(betterAuth);
app.use(r2);
app.use(aggregate, { name: "uploadedFilesAggregate" });
app.use(aggregate, { name: "uploadedFilesR2Aggregate" });

export default app;
