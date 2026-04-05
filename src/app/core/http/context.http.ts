import { HttpContextToken } from "@angular/common/http";

export const IS_PUBLIC_ENABLED = new HttpContextToken<boolean>(() => false);