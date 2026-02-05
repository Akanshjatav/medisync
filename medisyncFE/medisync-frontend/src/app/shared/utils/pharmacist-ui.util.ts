import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// ==================== Sidebar Utilities ====================

export function syncSidebarBodyClass(
  isBrowser: boolean,
  document: Document,
  isOpen: boolean
): void {
  if (!isBrowser) return;
  document.body.classList.toggle('sidebar-open', isOpen);
}

export function clearSidebarBodyClass(isBrowser: boolean, document: Document): void {
  if (!isBrowser) return;
  document.body.classList.remove('sidebar-open');
}

export function toggleSidebarState(
  isBrowser: boolean,
  document: Document,
  current: boolean
): boolean {
  const next = !current;
  syncSidebarBodyClass(isBrowser, document, next);
  return next;
}

export function closeSidebarState(isBrowser: boolean, document: Document): boolean {
  syncSidebarBodyClass(isBrowser, document, false);
  return false;
}

// ==================== Account Menu Utilities ====================

export function closeAccountMenuOnOutsideClick(
  isBrowser: boolean,
  document: Document,
  event: MouseEvent
): void {
  if (!isBrowser) return;
  const menu = document.getElementById('accountMenu') as HTMLDetailsElement | null;
  if (!menu) return;
  const target = event.target as HTMLElement;
  if (!menu.contains(target)) menu.open = false;
}

export function confirmLogout(router: Router): void {
  const ok = confirm('Are you sure you want to logout?');
  if (!ok) return;
  router.navigateByUrl('/login');
}

// ==================== Date Utilities ====================

/**
 * Safely parse a date string or Date object, returning a valid Date.
 * Falls back to current date if invalid.
 */
export function safeParseDate(isoOrDate: string | Date): Date {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Safely parse a date for sorting purposes.
 * Falls back to far-future date if invalid (for sort stability).
 */
export function safeParseDateForSort(iso: string): Date {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return new Date(8640000000000000);
  return d;
}

/**
 * Calculate the number of days between two dates.
 * Positive if `b` is after `a`, negative otherwise.
 */
export function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (24 * 3600 * 1000));
}

/**
 * Format a date to ISO date string (YYYY-MM-DD).
 */
export function formatISODate(isoOrDate: string | Date): string {
  const d = safeParseDate(isoOrDate);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/**
 * Create a date string offset by a number of days from now.
 */
export function addDaysFromNow(days: number): string {
  const x = new Date();
  x.setDate(x.getDate() + days);
  return x.toISOString().slice(0, 10);
}

/**
 * Pluralize a word based on count.
 */
export function pluralize(n: number, singular: string, plural?: string): string {
  return `${n} ${n === 1 ? singular : (plural || singular + 's')}`;
}

// ==================== LocalStorage Utilities ====================

/**
 * Get branch name from localStorage with fallback.
 */
export function getBranchFromStorage(isBrowser: boolean, fallback = 'TVM-Main'): string {
  if (!isBrowser) return fallback;
  return localStorage.getItem('currentBranch') || fallback;
}

/**
 * Check if browser platform for SSR safety.
 */
export function checkIsBrowser(platformId: object): boolean {
  return isPlatformBrowser(platformId);
}