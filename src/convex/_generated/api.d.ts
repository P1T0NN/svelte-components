/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auditLog from "../auditLog.js";
import type * as auth from "../auth.js";
import type * as auth_emails_resendOTP from "../auth/emails/resendOTP.js";
import type * as auth_emails_resendOTPPasswordReset from "../auth/emails/resendOTPPasswordReset.js";
import type * as auth_helpers_requireAdmin from "../auth/helpers/requireAdmin.js";
import type * as auth_middleware_authMiddleware from "../auth/middleware/authMiddleware.js";
import type * as auth_utils_convexGenerateVerificationToken from "../auth/utils/convexGenerateVerificationToken.js";
import type * as features from "../features.js";
import type * as helpers_createDeleteMutation from "../helpers/createDeleteMutation.js";
import type * as helpers_getRateLimitedUser from "../helpers/getRateLimitedUser.js";
import type * as helpers_getRateLimitedUserId from "../helpers/getRateLimitedUserId.js";
import type * as helpers_paginationHelpers from "../helpers/paginationHelpers.js";
import type * as http from "../http.js";
import type * as projectSettings from "../projectSettings.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as storage_aggregate_uploadedFilesAggregate from "../storage/aggregate/uploadedFilesAggregate.js";
import type * as storage_helpers_resolveUploadAuth from "../storage/helpers/resolveUploadAuth.js";
import type * as storage_storageMutations from "../storage/storageMutations.js";
import type * as storage_uploadedFiles from "../storage/uploadedFiles.js";
import type * as tables_users_usersQueries from "../tables/users/usersQueries.js";
import type * as types_convexTypes from "../types/convexTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auditLog: typeof auditLog;
  auth: typeof auth;
  "auth/emails/resendOTP": typeof auth_emails_resendOTP;
  "auth/emails/resendOTPPasswordReset": typeof auth_emails_resendOTPPasswordReset;
  "auth/helpers/requireAdmin": typeof auth_helpers_requireAdmin;
  "auth/middleware/authMiddleware": typeof auth_middleware_authMiddleware;
  "auth/utils/convexGenerateVerificationToken": typeof auth_utils_convexGenerateVerificationToken;
  features: typeof features;
  "helpers/createDeleteMutation": typeof helpers_createDeleteMutation;
  "helpers/getRateLimitedUser": typeof helpers_getRateLimitedUser;
  "helpers/getRateLimitedUserId": typeof helpers_getRateLimitedUserId;
  "helpers/paginationHelpers": typeof helpers_paginationHelpers;
  http: typeof http;
  projectSettings: typeof projectSettings;
  rateLimiter: typeof rateLimiter;
  "storage/aggregate/uploadedFilesAggregate": typeof storage_aggregate_uploadedFilesAggregate;
  "storage/helpers/resolveUploadAuth": typeof storage_helpers_resolveUploadAuth;
  "storage/storageMutations": typeof storage_storageMutations;
  "storage/uploadedFiles": typeof storage_uploadedFiles;
  "tables/users/usersQueries": typeof tables_users_usersQueries;
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
  uploadedFilesAggregate: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"uploadedFilesAggregate">;
};
