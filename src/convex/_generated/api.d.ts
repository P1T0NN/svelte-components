/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_auth from "../auth/auth.js";
import type * as auth_emails_sendVerificationOTP from "../auth/emails/sendVerificationOTP.js";
import type * as auth_helpers_getAuthUserId from "../auth/helpers/getAuthUserId.js";
import type * as auth_middleware_authMiddleware from "../auth/middleware/authMiddleware.js";
import type * as auth_queries_authQueries from "../auth/queries/authQueries.js";
import type * as crons from "../crons.js";
import type * as helpers_createDeleteMutation from "../helpers/createDeleteMutation.js";
import type * as helpers_fetchOptimized from "../helpers/fetchOptimized.js";
import type * as helpers_getRateLimitedUserId from "../helpers/getRateLimitedUserId.js";
import type * as helpers_paginationHelpers from "../helpers/paginationHelpers.js";
import type * as http from "../http.js";
import type * as projectSettings from "../projectSettings.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as storage_convexStorage_storageMutations from "../storage/convexStorage/storageMutations.js";
import type * as storage_convexStorage_uploadedFiles from "../storage/convexStorage/uploadedFiles.js";
import type * as storage_crons_cleanupOrphanDataConvexStorage from "../storage/crons/cleanupOrphanDataConvexStorage.js";
import type * as storage_crons_cleanupOrphanDataR2 from "../storage/crons/cleanupOrphanDataR2.js";
import type * as storage_r2_r2 from "../storage/r2/r2.js";
import type * as storage_r2_uploadedFilesR2 from "../storage/r2/uploadedFilesR2.js";
import type * as tables_auditLog_auditLogConfigs from "../tables/auditLog/auditLogConfigs.js";
import type * as tables_auditLog_crons_auditLogCron from "../tables/auditLog/crons/auditLogCron.js";
import type * as tables_auditLog_helpers_auditLogInternal from "../tables/auditLog/helpers/auditLogInternal.js";
import type * as tables_auditLog_helpers_logAudit from "../tables/auditLog/helpers/logAudit.js";
import type * as tables_auditLog_index from "../tables/auditLog/index.js";
import type * as tables_auditLog_queries_auditLogQueries from "../tables/auditLog/queries/auditLogQueries.js";
import type * as tables_auditLog_schemas_auditLogSchema from "../tables/auditLog/schemas/auditLogSchema.js";
import type * as tables_auditLog_utils_auditLogUtils from "../tables/auditLog/utils/auditLogUtils.js";
import type * as tables_test_testMutations from "../tables/test/testMutations.js";
import type * as tables_test_testQueries from "../tables/test/testQueries.js";
import type * as types_convexTypes from "../types/convexTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "auth/auth": typeof auth_auth;
  "auth/emails/sendVerificationOTP": typeof auth_emails_sendVerificationOTP;
  "auth/helpers/getAuthUserId": typeof auth_helpers_getAuthUserId;
  "auth/middleware/authMiddleware": typeof auth_middleware_authMiddleware;
  "auth/queries/authQueries": typeof auth_queries_authQueries;
  crons: typeof crons;
  "helpers/createDeleteMutation": typeof helpers_createDeleteMutation;
  "helpers/fetchOptimized": typeof helpers_fetchOptimized;
  "helpers/getRateLimitedUserId": typeof helpers_getRateLimitedUserId;
  "helpers/paginationHelpers": typeof helpers_paginationHelpers;
  http: typeof http;
  projectSettings: typeof projectSettings;
  rateLimiter: typeof rateLimiter;
  "storage/convexStorage/storageMutations": typeof storage_convexStorage_storageMutations;
  "storage/convexStorage/uploadedFiles": typeof storage_convexStorage_uploadedFiles;
  "storage/crons/cleanupOrphanDataConvexStorage": typeof storage_crons_cleanupOrphanDataConvexStorage;
  "storage/crons/cleanupOrphanDataR2": typeof storage_crons_cleanupOrphanDataR2;
  "storage/r2/r2": typeof storage_r2_r2;
  "storage/r2/uploadedFilesR2": typeof storage_r2_uploadedFilesR2;
  "tables/auditLog/auditLogConfigs": typeof tables_auditLog_auditLogConfigs;
  "tables/auditLog/crons/auditLogCron": typeof tables_auditLog_crons_auditLogCron;
  "tables/auditLog/helpers/auditLogInternal": typeof tables_auditLog_helpers_auditLogInternal;
  "tables/auditLog/helpers/logAudit": typeof tables_auditLog_helpers_logAudit;
  "tables/auditLog/index": typeof tables_auditLog_index;
  "tables/auditLog/queries/auditLogQueries": typeof tables_auditLog_queries_auditLogQueries;
  "tables/auditLog/schemas/auditLogSchema": typeof tables_auditLog_schemas_auditLogSchema;
  "tables/auditLog/utils/auditLogUtils": typeof tables_auditLog_utils_auditLogUtils;
  "tables/test/testMutations": typeof tables_test_testMutations;
  "tables/test/testQueries": typeof tables_test_testQueries;
  "types/convexTypes": typeof types_convexTypes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  betterAuth: import("../auth/component/_generated/component.js").ComponentApi<"betterAuth">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
};
