import { HttpContextToken } from "@angular/common/http";

// Define a context token to indicate whether the request is public (does not require authentication)
export const IS_PUBLIC_ENABLED = new HttpContextToken<boolean>(() => false);

// Define a context token to indicate whether to skip the loading indicator for the request
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);