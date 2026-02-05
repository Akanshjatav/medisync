import { Routes } from '@angular/router';

// Layout System
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { AuthLayoutComponent as NewAuthLayoutComponent } from './core/layout/auth-layout.component';
import { LegalLayoutComponent } from './core/layout/legal-layout.component';

// Auth Module
import { LoginComponent as AuthLoginComponent } from './modules/auth/login/login.component';
import { ForgotPasswordComponent as AuthForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';

// Head Office
import { HoDashboardComponent } from './pages/HeadOfficeManager/ho-dashboard/ho-dashboard.component';
import { BranchRegisterationComponent } from './pages/HeadOfficeManager/branch-registration/branch-registration.component';
import { BranchListComponent } from './pages/HeadOfficeManager/branch-management/branches/branch-list/branch-list.component';
import { AddUserComponent } from './pages/HeadOfficeManager/branch-management/branches/manage-branch/manage-branch.component';
import { BranchDetailComponent } from './pages/HeadOfficeManager/branch-management/branches/branch-detail/branch-detail.component';

// Pharmacist
import { DashboardComponent as PharmacistDashboardComponent } from './pages/pharmacist/dashboard/dashboard.component';
import { DispensingComponent } from './pages/pharmacist/dispensing/dispensing.component';
import { ExpiryComponent } from './pages/pharmacist/expiry/expiry.component';
import { InventoryComponent } from './pages/pharmacist/inventory/inventory.component';

// Store Manager
import { StoreManagerDashboardComponent } from './pages/StoreManager/store-manager-dashboard/store-manager-dashboard.component';

// Vendor
import { VendorProfileComponent } from './modules/vendor/profile/vendor-profile.component';

// Landing Page
import { LandingComponent } from './pages/landing/landing.component';

// Legal Pages
import { PrivacyComponent } from './modules/legal/privacy/privacy.component';
import { TermsComponent } from './modules/legal/terms/terms.component';
import { ContactComponent } from './modules/legal/contact/contact.component';
import { AboutComponent } from './modules/legal/about/about.component';
import { CookiesComponent } from './modules/legal/cookies/cookies.component';


export const routes: Routes = [
  // Default redirect to landing page
  { path: '', component: LandingComponent, pathMatch: 'full'
   },

  // ============================================
  // AUTH ROUTES (No Sidebar, Public Access)
  // ============================================
  {
    path: 'auth',
    component: NewAuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: AuthLoginComponent },
      { path: 'forgot-password', component: AuthForgotPasswordComponent },
    ]
  },

  // ============================================
  // HEAD OFFICE ROUTES (With Sidebar)
  // ============================================
  {
    path: 'head-office',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HoDashboardComponent },
      { path: 'branches', component: BranchListComponent },
      { path: 'branches/:id', component: BranchDetailComponent },
      { path: 'branches/:id/users/add', component: AddUserComponent },
      { path: 'register-branch', component: BranchRegisterationComponent },
    ]
  },

  // ============================================
  // PHARMACIST ROUTES (With Sidebar)
  // ============================================
  {
    path: 'pharmacist',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PharmacistDashboardComponent },
      { path: 'inventory', component: InventoryComponent },
      {
        path: 'add-medicine',
        loadComponent: () =>
          import('./pages/pharmacist/add-new-medicine/add-new-medicine.component')
            .then(m => m.AddNewMedicineComponent),
      },
      { path: 'dispensing', component: DispensingComponent },
      { path: 'expiry', component: ExpiryComponent },
      {
        path: 'request-stock',
        loadComponent: () =>
          import('./pages/pharmacist/request-stock/request-stock.component')
            .then(m => m.RequestStockComponent),
      },
    ],
  },

  // ============================================
  // STORE MANAGER ROUTES (With Sidebar)
  // ============================================
  {
    path: 'store-manager',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StoreManagerDashboardComponent },
      {
        path: 'rfq',
        loadComponent: () =>
          import('./pages/StoreManager/view-rfq/view-rfq.component').then(m => m.ViewRfqComponent),
      },
      {
        path: 'rfq/create',
        loadComponent: () =>
          import('./pages/StoreManager/create-rfq/rfq-create.component').then(m => m.RfqCreateComponent),
      },
      {
        path: 'create-bids/:rfqId',
        loadComponent: () =>
          import('./pages/StoreManager/create-bids/create-bids.component').then(m => m.CreateBidsComponent)
      },
    ]
  },

  // ============================================
  // VENDOR ROUTES (With Sidebar)
  // ============================================
  {
    path: 'vendor',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: VendorProfileComponent },
      { path: 'dashboard', redirectTo: 'profile', pathMatch: 'full' }, // For now, dashboard goes to profile
      // TODO: Create these components
      // { path: 'rfqs', component: VendorRfqListComponent },
      // { path: 'bids', component: VendorBidListComponent },
    ]
  },

  // ============================================
  // LEGAL/STATIC PAGES (Centered Layout)
  // ============================================
  {
    path: '',
    component: LegalLayoutComponent,
    children: [
      { path: 'privacy', component: PrivacyComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'about', component: AboutComponent },
      { path: 'cookies', component: CookiesComponent },
    ]
  },

  // Catch-all redirect
  { path: '**', redirectTo: '/auth/login' }
];