import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../../core/layout/footer/footer.component';
import { GlobeComponent } from '../../shared/components/globe/globe.component';
import { MarqueeComponent } from '../../shared/components/marquee/marquee.component';

interface Tender {
  title: string;
  volume: string;
  schedule: string;
  deadline: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent, MarqueeComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, OnDestroy {
  // Mobile menu state
  navOpen = false;

  // Current year for footer
  currentYear = new Date().getFullYear();

  // Platform check
  private isBrowser: boolean;

  // Sample tender data
  tenders: Tender[] = [
    {
      title: 'RFQ-2026-01: Antibiotics (500+ units)',
      volume: '500+ units',
      schedule: 'Schedule H',
      deadline: 'Feb 18, 2026',
      description: 'Enterprise bulk order for multi-store distribution. Includes compliance checks, on-time delivery SLA.'
    },
    {
      title: 'RFQ-2026-02: OTC & Supplements (240+ units)',
      volume: '240+ units',
      schedule: 'OTC',
      deadline: 'Feb 20, 2026',
      description: 'Seasonal inventory replenishment. Multi-vendor bids welcome.'
    },
    {
      title: 'RFQ-2026-03: Cold Chain (90 units)',
      volume: '90 units',
      schedule: 'Temperature-controlled',
      deadline: 'Feb 25, 2026',
      description: 'Refrigerated storage requirements with delivery & handling SLA.'
    }
  ];

  // Stats
  stats = [
    { value: '12,480+', label: 'Active Users' },
    { value: '340+', label: 'Live Stores' },
    { value: '15K+', label: 'SKUs Tracked' },
    { value: '92', label: 'Avg Delivery Score' },
    { value: '480+', label: 'Tender Cycles/yr' }
  ];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Only run in browser
    if (this.isBrowser) {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflowX = 'hidden';
    }
  }

  ngOnDestroy(): void {
    // Only run in browser
    if (this.isBrowser) {
      document.body.style.overflowX = '';
    }
  }

  toggleNav(): void {
    this.navOpen = !this.navOpen;
  }

  closeNav(): void {
    this.navOpen = false;
  }

  scrollToSection(sectionId: string): void {
    this.closeNav();
    if (this.isBrowser) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  navigateToLogin(): void {
    this.closeNav();
    this.router.navigate(['/auth/login']);
  }
}
