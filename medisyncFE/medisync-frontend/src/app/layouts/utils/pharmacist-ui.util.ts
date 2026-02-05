import { Router } from '@angular/router';

/**
 * Closes the <details id="accountMenu"> dropdown when user clicks outside it.
 * This matches your layout HTML:
 *   <details class="menu" id="accountMenu">...</details>
 */
export function closeAccountMenuOnOutsideClick(
  isBrowser: boolean,
  document: Document,
  event: MouseEvent
): void {
  if (!isBrowser) return;

  const menu = document.getElementById('accountMenu') as HTMLDetailsElement | null;
  if (!menu) return;

  // Click target
  const target = event.target as Node | null;
  if (!target) return;

  // If click is inside the <details>, do nothing
  if (menu.contains(target)) return;

  // Otherwise close it
  menu.removeAttribute('open');
}

/**
 * Simple logout flow (no JWT/session as per your requirement).
 * - Shows a confirm dialog
 * - Navigates to /login if confirmed
 */
export function confirmLogout(router: Router): void {
  const ok = window.confirm('Are you sure you want to logout?');
  if (!ok) return;

  // No storage clearing required (you said simple for now),
  // but if later you add session/local storage, clear it here.

  router.navigate(['/login']);
}