import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BrowserStorageService } from '../../services/browser-storage.service';

interface NavItem {
  label: string;
  route: string | any[];
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent  {
  navItems: NavItem[] = [];
  userRole: string = '';
  
trackByRoute(_: number, item: NavItem) {
    return Array.isArray(item.route) ? item.route.join('/') : item.route;
  }

  constructor(
    private storage: BrowserStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get role from session/localStorage
    this.userRole = this.storage.getItem('USER_ROLE') || this.storage.getItem('USER_ROLE', 'local') || '';
    
    // Fallback: Detect role from current route if not in storage (for testing)
    if (!this.userRole) {
      this.userRole = this.detectRoleFromRoute();
    }
    
    this.loadNavItems();
  }
  
  private detectRoleFromRoute(): string {
    const url = this.router.url;
    if (url.startsWith('/head-office')) return 'HEAD_OFFICE';
    if (url.startsWith('/pharmacist')) return 'PHARMACIST';
    if (url.startsWith('/store-manager')) return 'STORE_MANAGER';
    if (url.startsWith('/vendor')) return 'VENDOR';
    return '';
  }

  private loadNavItems(): void {
    switch (this.userRole) {
      case 'HEAD_OFFICE':
        this.navItems = [
          { label: 'Dashboard', route: '/head-office/dashboard' },
          { label: 'Branches', route: '/head-office/branches' },
          { label: 'Register Branch', route: '/head-office/register-branch' },
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

      case 'STORE_MANAGER':
        this.navItems = [
          { label: 'Dashboard', route: '/store-manager/dashboard' },
          { label: 'RFQ Management', route: '/store-manager/rfq' },
          { label: 'Create RFQ', route: '/store-manager/rfq/create' },
          { label: 'Stock Requests', route: '/store-manager/stock-requests' },
          { label: 'Vendor Management', route: '/store-manager/vendors' },
        ];
        break;

      case 'VENDOR':
        this.navItems = [
          { label: 'Dashboard', route: '/vendor/dashboard' },
          { label: 'Profile', route: '/vendor/profile' },
          { label: 'Browse RFQs', route: '/vendor/rfqs' },
          { label: 'My Bids', route: '/vendor/bids' },
        ];
        break;

      default:
        this.navItems = [];
    }
  }
}
