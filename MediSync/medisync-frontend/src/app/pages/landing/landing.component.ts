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
      title: 'RFQ 2026 001: Essential Antibiotics Bulk Order',
      volume: '800+ units',
      schedule: 'Schedule H',
      deadline: 'Feb 18, 2026',
      description: 'Large scale procurement of essential antibiotics for multi branch distribution. Requires valid drug license, quality certifications, and temperature controlled logistics capabilities.'
    },
    {
      title: 'RFQ 2026 002: OTC Medicines and Health Supplements',
      volume: '1,200+ units',
      schedule: 'OTC',
      deadline: 'Feb 20, 2026',
      description: 'Seasonal inventory replenishment for over the counter medications and nutritional supplements. Looking for competitive pricing with assured quality standards.'
    },
    {
      title: 'RFQ 2026 003: Cold Chain Vaccines and Biologics',
      volume: '150 units',
      schedule: 'Temperature Controlled',
      deadline: 'Feb 25, 2026',
      description: 'Specialized procurement requiring strict cold chain compliance from 2°C to 8°C. Must have validated refrigerated transport and real time temperature monitoring systems.'
    }
  ];

  // Stats
  stats = [
    { value: '15,000+', label: 'Healthcare Professionals' },
    { value: '450+', label: 'Pharmacy Branches' },
    { value: '25,000+', label: 'Medicines Tracked' },
    { value: '98%', label: 'System Uptime' },
    { value: '750+', label: 'Annual Tenders' }
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
