import { InjectionToken } from '@angular/core';

/**
 * Holds the raw Cookie header from the incoming request to the SSR server.
 * Example: "JSESSIONID=abc...; other=value"
 */
export const SSR_COOKIE_HEADER = new InjectionToken<string>('SSR_COOKIE_HEADER');