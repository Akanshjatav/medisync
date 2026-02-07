import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BrowserStorageService } from '../../services/browser-storage.service';

interface NavItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [];
  userRole: 'HO' | 'MANAGER' | 'PHARMACIST' | 'VENDOR' | '' = '';

  constructor(
    private storage: BrowserStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1️⃣ Read role from storage
    const storedRole =
      this.storage.getItem('USER_ROLE') ||
      this.storage.getItem('USER_ROLE', 'local');

    // 2️⃣ Normalize role
    this.userRole = this.normalizeRole(storedRole);

    // 3️⃣ Fallback: detect from URL (important for refresh)
    if (!this.userRole) {
      this.userRole = this.detectRoleFromRoute();
    }

    // 4️⃣ Build sidebar
    this.loadNavItems();
  }

  // ---------------- helpers ----------------

  private normalizeRole(role?: string | null): any {
    switch ((role || '').toUpperCase()) {
      case 'HO':
      case 'HEAD-OFFICE':
        return 'HO';
      case 'MANAGER':
        return 'MANAGER';
      case 'PHARMACIST':
        return 'PHARMACIST';
      case 'VENDOR':
        return 'VENDOR';
      default:
        return '';
    }
  }

  private detectRoleFromRoute(): any {
    const url = this.router.url;

    if (url.startsWith('/head-office')) return 'HO';
    if (url.startsWith('/pharmacist')) return 'PHARMACIST';
    if (url.startsWith('/store-manager')) return 'MANAGER';
    if (url.startsWith('/vendor')){
      if(url.endsWith('register')) return '';
            if(url.startsWith('/vendor/create-bids')) return '';

          return 'VENDOR';
    } 

    return '';
  }

  // ---------------- sidebar config ----------------

  private loadNavItems(): void {
    switch (this.userRole) {
      case 'HO':
        this.navItems = [
          { label: 'Dashboard', route: '/head-office/dashboard' },
          { label: 'Branches', route: '/head-office/branches' },
          { label: 'Register Branch', route: '/head-office/register-branch' },
          { label: 'User Management', route: '/head-office/branches/:id/users/add' },
        ];
        break;

      case 'PHARMACIST':
        this.navItems = [
          { label: 'Dashboard', route: '/pharmacist/dashboard' },
          { label: 'Inventory', route: '/pharmacist/inventory' },
          { label: 'Add Medicine', route: '/pharmacist/add-medicine' },
          { label: 'Dispensing', route: '/pharmacist/dispensing' },
          { label: 'Expiry', route: '/pharmacist/expiry' },
          { label: 'Request Stock', route: '/pharmacist/request-stock' },
        ];
        break;

      case 'MANAGER':
        this.navItems = [
          { label: 'Dashboard', route: '/store-manager/dashboard' },
          { label: 'RFQ Management', route: '/store-manager/rfq' },
          { label: 'Create RFQ', route: '/store-manager/rfq/create' },
          { label: 'View Bids', route: '/store-manager/bids' }, 
          // { label: 'Vendor Verification', route: '/store-manager/vendor/verification' }, 
  //add view bids route here
        ];
        break;

      case 'VENDOR':
        this.navItems = [
          { label: 'Dashboard', route: '/vendor/dashboard' },
          { label: 'Profile', route: '/vendor/profile' },
          { label: 'Browse RFQs', route: '/vendor/rfqs' },
        ];
        break;

      default:
        this.navItems = [];
    }
  }
}
