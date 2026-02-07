// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';

// type Kpi = { title: string; value: number; sub: string };
// type ActivityItem = { text: string; when: string };

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, RouterLink],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css'],
// })
// export class DashboardComponent {
//   lastUpdated = new Date().toLocaleString();

//   kpis: Kpi[] = [
//     { title: 'Dispensing Pending', value: 6, sub: 'Prescriptions waiting' },
//     { title: 'Expiring Soon', value: 5, sub: 'Within 30 days' },
//     { title: 'Low Stock Items', value: 3, sub: 'Below reorder level' },
//   ];

//   recentActivity: ActivityItem[] = [
//     { text: 'Dispensed RX‑10241 • Paracetamol 500mg', when: 'Today' },
//     { text: 'Added batch IBU‑2025‑11 • Ibuprofen', when: 'Yesterday' },
//     { text: 'Requested stock • Amoxicillin 250mg', when: '2 days ago' },
//   ];
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type ActionCard = {
  title: string;
  desc: string;
  route: string;
  icon: string;
  tone: 'primary' | 'secondary' | 'ghost';
};

type FocusItem = { text: string; badge?: string };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  lastUpdated = new Date().toLocaleString();

  /** ✅ Main pharmacist actions */
  actions: ActionCard[] = [
    {
      title: 'Billing',
      desc: 'Process prescriptions and mark as dispensed.',
      route: '/pharmacist/dispensing',
      icon: '💊',
      tone: 'primary',
    },
    {
      title: 'View Inventory',
      desc: 'Search medicines, check availability & expiry.',
      route: '/pharmacist/inventory',
      icon: '📋',
      tone: 'ghost',
    },
    {
      title: 'Add New Batch',
      desc: 'Enter new medicine batch from vendor.',
      route: '/pharmacist/add-new-medicine',
      icon: '➕',
      tone: 'secondary',
    },
    {
      title: 'Stock Request',
      desc: 'Request low stock items from store.',
      route: '/pharmacist/request-stock',
      icon: '📦',
      tone: 'ghost',
    },
  ];

  /**
   * Optional “Today’s Focus” (static placeholders)
   * Replace with API results later.
   */
  todaysFocus: FocusItem[] = [
    { text: 'Finish pending dispensing tasks', badge: 'Priority' },
    { text: 'Check near-expiry items before issuing' },
    { text: 'Verify stock levels after batch entry' },
  ];

  quickTips: FocusItem[] = [
    { text: 'Use “View Inventory” search to verify availability instantly.' },
    { text: 'Add batch → then re-check inventory to confirm updates.' },
    { text: 'Before dispensing, check expiry date & batch quantity.' },
  ];

  refresh() {
    this.lastUpdated = new Date().toLocaleString();
  }
}
