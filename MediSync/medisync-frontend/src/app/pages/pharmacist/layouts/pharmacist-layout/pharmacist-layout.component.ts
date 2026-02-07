import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { closeAccountMenuOnOutsideClick, confirmLogout } from '../../../utils/pharmacist-ui.util';

@Component({
  selector: 'app-pharmacist-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './pharmacist-layout.component.html',
  styleUrl: './pharmacist-layout.component.css',
  encapsulation: ViewEncapsulation.None
})
export class PharmacistLayoutComponent implements OnInit {
  private isBrowser = false;

  sidebarOpen = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    confirmLogout(this.router);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    closeAccountMenuOnOutsideClick(this.isBrowser, this.document, event);
  }
}
