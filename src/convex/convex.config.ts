// LIBRARIES
import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import r2 from "@convex-dev/r2/convex.config.js";
import betterAuth from './auth/component/convex.config';

const app = defineApp();
app.use(rateLimiter);
app.use(betterAuth);
app.use(r2);

export default app;
