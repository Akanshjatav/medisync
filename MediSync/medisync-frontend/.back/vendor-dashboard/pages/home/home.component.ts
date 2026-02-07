// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * HomeComponent
 * - Simple landing page with quick navigation to main modules.
 * - Keeps logic minimal; the template already contains most of the static content.
 * - Extend here if you want to prefetch data or open dialogs from Home.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(private router: Router) {}

  /** Navigate to Dashboard */
  gotoDashboard() {
    this.router.navigate(['/dashboard']);
  }

  /** Navigate to RFQs list */
  gotoRfqs() {
    this.router.navigate(['/rfqs']);
  }

  /** Navigate to Profile page */
  gotoProfile() {
    this.router.navigate(['/profile']);
  }

  /** Current year for footer (if needed in template) */
  get year(): number {
    return new Date().getFullYear();
  }
}
