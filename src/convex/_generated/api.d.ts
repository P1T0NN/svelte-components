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
import type * as emails_resendOTP from "../emails/resendOTP.js";
import type * as emails_resendOTPPasswordReset from "../emails/resendOTPPasswordReset.js";
import type * as features from "../features.js";
import type * as helpers_createDeleteMutation from "../helpers/createDeleteMutation.js";
import type * as helpers_getRateLimitedUser from "../helpers/getRateLimitedUser.js";
import type * as helpers_getRateLimitedUserId from "../helpers/getRateLimitedUserId.js";
import type * as helpers_paginationHelpers from "../helpers/paginationHelpers.js";
import type * as helpers_requireAdmin from "../helpers/requireAdmin.js";
import type * as helpers_resolveUploadAuth from "../helpers/resolveUploadAuth.js";
import type * as http from "../http.js";
import type * as middleware_authMiddleware from "../middleware/authMiddleware.js";
import type * as projectSettings from "../projectSettings.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as storage_storageMutations from "../storage/storageMutations.js";
import type * as tables_uploadedFiles_uploadedFilesAggregate from "../tables/uploadedFiles/uploadedFilesAggregate.js";
import type * as tables_uploadedFiles_uploadedFilesMutations from "../tables/uploadedFiles/uploadedFilesMutations.js";
import type * as tables_uploadedFiles_uploadedFilesQueries from "../tables/uploadedFiles/uploadedFilesQueries.js";
import type * as tables_users_usersQueries from "../tables/users/usersQueries.js";
import type * as types_convexTypes from "../types/convexTypes.js";
import type * as utils_convexGenerateVerificationToken from "../utils/convexGenerateVerificationToken.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auditLog: typeof auditLog;
  auth: typeof auth;
  "emails/resendOTP": typeof emails_resendOTP;
  "emails/resendOTPPasswordReset": typeof emails_resendOTPPasswordReset;
  features: typeof features;
  "helpers/createDeleteMutation": typeof helpers_createDeleteMutation;
  "helpers/getRateLimitedUser": typeof helpers_getRateLimitedUser;
  "helpers/getRateLimitedUserId": typeof helpers_getRateLimitedUserId;
  "helpers/paginationHelpers": typeof helpers_paginationHelpers;
  "helpers/requireAdmin": typeof helpers_requireAdmin;
  "helpers/resolveUploadAuth": typeof helpers_resolveUploadAuth;
  http: typeof http;
  "middleware/authMiddleware": typeof middleware_authMiddleware;
  projectSettings: typeof projectSettings;
  rateLimiter: typeof rateLimiter;
  "storage/storageMutations": typeof storage_storageMutations;
  "tables/uploadedFiles/uploadedFilesAggregate": typeof tables_uploadedFiles_uploadedFilesAggregate;
  "tables/uploadedFiles/uploadedFilesMutations": typeof tables_uploadedFiles_uploadedFilesMutations;
  "tables/uploadedFiles/uploadedFilesQueries": typeof tables_uploadedFiles_uploadedFilesQueries;
  "tables/users/usersQueries": typeof tables_users_usersQueries;
  "types/convexTypes": typeof types_convexTypes;
  "utils/convexGenerateVerificationToken": typeof utils_convexGenerateVerificationToken;
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
