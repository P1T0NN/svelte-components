// LIBRARIES
import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import betterAuth from './auth/component/convex.config';

const app = defineApp();
app.use(rateLimiter);
app.use(betterAuth);
app.use(aggregate, { name: "uploadedFilesAggregate" });

export default app;