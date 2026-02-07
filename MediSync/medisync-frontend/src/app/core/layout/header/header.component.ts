import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { BrowserStorageService } from '../../services/browser-storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() showAccountMenu = true;
  @Input() showMiniNav = false;

  constructor(
    private router: Router,
    private storage: BrowserStorageService
  ) {}

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      // Clear session/token
      this.storage.clear('both');
      this.router.navigate(['/auth/login']);
    }
  }
}
