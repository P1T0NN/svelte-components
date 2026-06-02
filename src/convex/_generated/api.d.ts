/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics_analyticsConfigs from "../analytics/analyticsConfigs.js";
import type * as analytics_analyticsSettings from "../analytics/analyticsSettings.js";
import type * as analytics_crons_analyticsCron from "../analytics/crons/analyticsCron.js";
import type * as analytics_helpers_aggregateEvent from "../analytics/helpers/aggregateEvent.js";
import type * as analytics_helpers_analyticsAccess from "../analytics/helpers/analyticsAccess.js";
import type * as analytics_helpers_analyticsInternal from "../analytics/helpers/analyticsInternal.js";
import type * as analytics_helpers_backfillMetric from "../analytics/helpers/backfillMetric.js";
import type * as analytics_helpers_trackEvent from "../analytics/helpers/trackEvent.js";
import type * as analytics_index from "../analytics/index.js";
import type * as analytics_queries_analyticsQueries from "../analytics/queries/analyticsQueries.js";
import type * as analytics_registerAnalyticsCrons from "../analytics/registerAnalyticsCrons.js";
import type * as analytics_schemas_analyticsTableSchema from "../analytics/schemas/analyticsTableSchema.js";
import type * as analytics_types_analyticsTypes from "../analytics/types/analyticsTypes.js";
import type * as analytics_utils_analyticsDateUtils from "../analytics/utils/analyticsDateUtils.js";
import type * as analytics_utils_analyticsFormatUtils from "../analytics/utils/analyticsFormatUtils.js";
import type * as analytics_utils_analyticsValidation from "../analytics/utils/analyticsValidation.js";
import type * as auth_auth from "../auth/auth.js";
import type * as auth_authRoutes from "../auth/authRoutes.js";
import type * as auth_convexCreateAuthRateLimitHook from "../auth/convexCreateAuthRateLimitHook.js";
import type * as auth_emails_sendVerificationOTP from "../auth/emails/sendVerificationOTP.js";
import type * as auth_helpers_getAuthUserId from "../auth/helpers/getAuthUserId.js";
import type * as auth_middleware_authMiddleware from "../auth/middleware/authMiddleware.js";
import type * as auth_queries_authQueries from "../auth/queries/authQueries.js";
import type * as auth_utils_getEmailFromAuthBody from "../auth/utils/getEmailFromAuthBody.js";
import type * as convexRateLimiter from "../convexRateLimiter.js";
import type * as crons from "../crons.js";
import type * as helpers_convexGetRateLimitedUserId from "../helpers/convexGetRateLimitedUserId.js";
import type * as helpers_createDeleteMutation from "../helpers/createDeleteMutation.js";
import type * as helpers_createSearchQuery from "../helpers/createSearchQuery.js";
import type * as helpers_fetchOptimized from "../helpers/fetchOptimized.js";
import type * as helpers_paginationHelpers from "../helpers/paginationHelpers.js";
import type * as http from "../http.js";
import type * as projectSettings from "../projectSettings.js";
import type * as rateLimits_convexCreateRateLimit from "../rateLimits/convexCreateRateLimit.js";
import type * as rateLimits_convexCreateRateLimitInternal from "../rateLimits/convexCreateRateLimitInternal.js";
import type * as rateLimits_registry from "../rateLimits/registry.js";
import type * as rateLimits_searchRateLimitMutations from "../rateLimits/searchRateLimitMutations.js";
import type * as storage_convexStorage_storageMutations from "../storage/convexStorage/storageMutations.js";
import type * as storage_convexStorage_uploadedFiles from "../storage/convexStorage/uploadedFiles.js";
import type * as storage_crons_cleanupOrphanDataConvexStorage from "../storage/crons/cleanupOrphanDataConvexStorage.js";
import type * as storage_crons_cleanupOrphanDataR2 from "../storage/crons/cleanupOrphanDataR2.js";
import type * as storage_r2_r2 from "../storage/r2/r2.js";
import type * as storage_r2_uploadedFilesR2 from "../storage/r2/uploadedFilesR2.js";
import type * as storage_registerStorageCrons from "../storage/registerStorageCrons.js";
import type * as tables_auditLog_auditLogConfigs from "../tables/auditLog/auditLogConfigs.js";
import type * as tables_auditLog_crons_auditLogCron from "../tables/auditLog/crons/auditLogCron.js";
import type * as tables_auditLog_helpers_auditLogInternal from "../tables/auditLog/helpers/auditLogInternal.js";
import type * as tables_auditLog_helpers_logAudit from "../tables/auditLog/helpers/logAudit.js";
import type * as tables_auditLog_index from "../tables/auditLog/index.js";
import type * as tables_auditLog_queries_auditLogQueries from "../tables/auditLog/queries/auditLogQueries.js";
import type * as tables_auditLog_registerAuditLogCrons from "../tables/auditLog/registerAuditLogCrons.js";
import type * as tables_auditLog_schemas_auditLogSchema from "../tables/auditLog/schemas/auditLogSchema.js";
import type * as tables_auditLog_utils_auditLogUtils from "../tables/auditLog/utils/auditLogUtils.js";
import type * as tables_test_testMutations from "../tables/test/testMutations.js";
import type * as tables_test_testQueries from "../tables/test/testQueries.js";
import type * as tables_users_userMutations from "../tables/users/userMutations.js";
import type * as tables_users_userQueries from "../tables/users/userQueries.js";
import type * as types_convexTypes from "../types/convexTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "analytics/analyticsConfigs": typeof analytics_analyticsConfigs;
  "analytics/analyticsSettings": typeof analytics_analyticsSettings;
  "analytics/crons/analyticsCron": typeof analytics_crons_analyticsCron;
  "analytics/helpers/aggregateEvent": typeof analytics_helpers_aggregateEvent;
  "analytics/helpers/analyticsAccess": typeof analytics_helpers_analyticsAccess;
  "analytics/helpers/analyticsInternal": typeof analytics_helpers_analyticsInternal;
  "analytics/helpers/backfillMetric": typeof analytics_helpers_backfillMetric;
  "analytics/helpers/trackEvent": typeof analytics_helpers_trackEvent;
  "analytics/index": typeof analytics_index;
  "analytics/queries/analyticsQueries": typeof analytics_queries_analyticsQueries;
  "analytics/registerAnalyticsCrons": typeof analytics_registerAnalyticsCrons;
  "analytics/schemas/analyticsTableSchema": typeof analytics_schemas_analyticsTableSchema;
  "analytics/types/analyticsTypes": typeof analytics_types_analyticsTypes;
  "analytics/utils/analyticsDateUtils": typeof analytics_utils_analyticsDateUtils;
  "analytics/utils/analyticsFormatUtils": typeof analytics_utils_analyticsFormatUtils;
  "analytics/utils/analyticsValidation": typeof analytics_utils_analyticsValidation;
  "auth/auth": typeof auth_auth;
  "auth/authRoutes": typeof auth_authRoutes;
  "auth/convexCreateAuthRateLimitHook": typeof auth_convexCreateAuthRateLimitHook;
  "auth/emails/sendVerificationOTP": typeof auth_emails_sendVerificationOTP;
  "auth/helpers/getAuthUserId": typeof auth_helpers_getAuthUserId;
  "auth/middleware/authMiddleware": typeof auth_middleware_authMiddleware;
  "auth/queries/authQueries": typeof auth_queries_authQueries;
  "auth/utils/getEmailFromAuthBody": typeof auth_utils_getEmailFromAuthBody;
  convexRateLimiter: typeof convexRateLimiter;
  crons: typeof crons;
  "helpers/convexGetRateLimitedUserId": typeof helpers_convexGetRateLimitedUserId;
  "helpers/createDeleteMutation": typeof helpers_createDeleteMutation;
  "helpers/createSearchQuery": typeof helpers_createSearchQuery;
  "helpers/fetchOptimized": typeof helpers_fetchOptimized;
  "helpers/paginationHelpers": typeof helpers_paginationHelpers;
  http: typeof http;
  projectSettings: typeof projectSettings;
  "rateLimits/convexCreateRateLimit": typeof rateLimits_convexCreateRateLimit;
  "rateLimits/convexCreateRateLimitInternal": typeof rateLimits_convexCreateRateLimitInternal;
  "rateLimits/registry": typeof rateLimits_registry;
  "rateLimits/searchRateLimitMutations": typeof rateLimits_searchRateLimitMutations;
  "storage/convexStorage/storageMutations": typeof storage_convexStorage_storageMutations;
  "storage/convexStorage/uploadedFiles": typeof storage_convexStorage_uploadedFiles;
  "storage/crons/cleanupOrphanDataConvexStorage": typeof storage_crons_cleanupOrphanDataConvexStorage;
  "storage/crons/cleanupOrphanDataR2": typeof storage_crons_cleanupOrphanDataR2;
  "storage/r2/r2": typeof storage_r2_r2;
  "storage/r2/uploadedFilesR2": typeof storage_r2_uploadedFilesR2;
  "storage/registerStorageCrons": typeof storage_registerStorageCrons;
  "tables/auditLog/auditLogConfigs": typeof tables_auditLog_auditLogConfigs;
  "tables/auditLog/crons/auditLogCron": typeof tables_auditLog_crons_auditLogCron;
  "tables/auditLog/helpers/auditLogInternal": typeof tables_auditLog_helpers_auditLogInternal;
  "tables/auditLog/helpers/logAudit": typeof tables_auditLog_helpers_logAudit;
  "tables/auditLog/index": typeof tables_auditLog_index;
  "tables/auditLog/queries/auditLogQueries": typeof tables_auditLog_queries_auditLogQueries;
  "tables/auditLog/registerAuditLogCrons": typeof tables_auditLog_registerAuditLogCrons;
  "tables/auditLog/schemas/auditLogSchema": typeof tables_auditLog_schemas_auditLogSchema;
  "tables/auditLog/utils/auditLogUtils": typeof tables_auditLog_utils_auditLogUtils;
  "tables/test/testMutations": typeof tables_test_testMutations;
  "tables/test/testQueries": typeof tables_test_testQueries;
  "tables/users/userMutations": typeof tables_users_userMutations;
  "tables/users/userQueries": typeof tables_users_userQueries;
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
