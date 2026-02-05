import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { closeAccountMenuOnOutsideClick, confirmLogout } from '../utils/pharmacist-ui.util';

@Component({
  selector: 'app-common-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './common-layout.component.html',
  styleUrl: './common-layout.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CommonLayoutComponent implements OnInit {
  private isBrowser = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  logout(): void {
    confirmLogout(this.router);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    closeAccountMenuOnOutsideClick(this.isBrowser, this.document, event);
  }
}