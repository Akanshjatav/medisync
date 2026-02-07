import { Routes } from '@angular/router';

// Layout System
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { AuthLayoutComponent as NewAuthLayoutComponent } from './core/layout/auth-layout.component';
import { LegalLayoutComponent } from './core/layout/legal-layout.component';
import { VendorDocsVerificationComponent } from './pages/StoreManager/vendor-docs-verification/vendor-docs-verification.component';
// Auth Module
import { LoginComponent as AuthLoginComponent } from './modules/auth/login/login.component';
import { ForgotPasswordComponent as AuthForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';

// Head Office
import { HoDashboardComponent } from './pages/HeadOfficeManager/ho-dashboard/ho-dashboard.component';
import { BranchRegisterationComponent } from './pages/HeadOfficeManager/branch-registration/branch-registration.component';
import { BranchListComponent } from './pages/HeadOfficeManager/branch-management/branches/branch-list/branch-list.component';
import { UserManagementComponent } from './pages/HeadOfficeManager/user-management/user-management.component';
import { BranchDetailComponent } from './pages/HeadOfficeManager/branch-management/branches/branch-detail/branch-detail.component';
import { ManageBranchComponent } from './pages/HeadOfficeManager/branch-management/branches/manage-branch/manage-branch.component';

// Pharmacist
import { DashboardComponent as PharmacistDashboardComponent } from './pages/pharmacist/dashboard/dashboard.component';
import { DispensingComponent } from './pages/pharmacist/dispensing/dispensing.component';
import { ExpiryComponent } from './pages/pharmacist/expiry/expiry.component';
import { InventoryComponent } from './pages/pharmacist/inventory/inventory.component';

// Store Manager
import { StoreManagerDashboardComponent } from './pages/StoreManager/store-manager-dashboard/store-manager-dashboard.component';

// Vendor
import { VendorProfileComponent } from './modules/vendor/profile/vendor-profile.component';
import { RfqListComponent } from './pages/vendor/rfq-list/rfq-list.component';
import { VendorRegistrationComponent } from './pages/vendor/vendor-registration/vendor-registration.component';
import { CreateBidsComponent } from './pages/vendor/create-bids/create-bids.component';

// Landing Page
import { LandingComponent } from './pages/landing/landing.component';

// Legal Pages
import { PrivacyComponent } from './modules/legal/privacy/privacy.component';
import { TermsComponent } from './modules/legal/terms/terms.component';
import { ContactComponent } from './modules/legal/contact/contact.component';
import { AboutComponent } from './modules/legal/about/about.component';
import { CookiesComponent } from './modules/legal/cookies/cookies.component';

export const routes: Routes = [
  // Default landing
  { path: '', component: LandingComponent, pathMatch: 'full' },

  // ✅ Alias route so /login works
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },

  // ============================================
  // AUTH ROUTES (Public)
  // ============================================
  {
    path: 'auth',
    component: NewAuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: AuthLoginComponent },
      { path: 'forgot-password', component: AuthForgotPasswordComponent }
    ]
  },

  // ✅ Vendor registration is public
  { path: 'vendor/register', component: VendorRegistrationComponent },

  // ============================================
  // HEAD OFFICE ROUTES
  // ============================================
  {
    path: 'head-office',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HoDashboardComponent },
      { path: 'branches', component: BranchListComponent },
      { path: 'branches/:id', component: BranchDetailComponent },
      { path: 'users/:id/users/add', component: UserManagementComponent },
      { path: 'register-branch', component: BranchRegisterationComponent },
      { path: 'branches/:id/manage', component: ManageBranchComponent },
{ path: 'branches/:id/users/add', component: UserManagementComponent }    ]
  },

  // ============================================
  // PHARMACIST ROUTES
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
            .then(m => m.AddNewMedicineComponent)
      },
      { path: 'dispensing', component: DispensingComponent },
      { path: 'expiry', component: ExpiryComponent },
      {
        path: 'request-stock',
        loadComponent: () =>
          import('./pages/pharmacist/request-stock/request-stock.component')
            .then(m => m.RequestStockComponent)
      }
    ]
  },

  // ============================================
  // STORE MANAGER ROUTES
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
          import('./pages/StoreManager/view-rfq/view-rfq.component')
            .then(m => m.ViewRfqComponent)
      },
      {
        path: 'rfq/create',
        loadComponent: () =>
          import('./pages/StoreManager/create-rfq/rfq-create.component')
            .then(m => m.RfqCreateComponent)
      },
      {
        path: 'bids',
        loadComponent: () =>
          import('./pages/StoreManager/bids/bids.component').then(m => m.BidsComponent)
      },
      {
        path: 'vendor/verification',
        loadComponent: () =>
          import('./pages/StoreManager/vendor-docs-verification/vendor-docs-verification.component').then(m => m.VendorDocsVerificationComponent)
      },
    ]
  },

  // ============================================
  // VENDOR ROUTES (Protected by your backend/session)
  // ============================================
  {
  path: 'vendor',
  component: MainLayoutComponent,
  children: [
    { path: '', redirectTo: 'profile', pathMatch: 'full' },
    { path: 'profile', component: VendorProfileComponent },
    
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./pages/vendor/dashboard/vendor-dashboard.component')
          .then(m => m.VendorDashboardComponent)
    },


    { path: 'create-bids/:rfqId', component: CreateBidsComponent },
    { path: 'rfqs', component: RfqListComponent },

    // Remove or change this if not needed:
    // { path: 'bids', component: CreateBidsComponent }
  ]
},

  // ============================================
  // LEGAL/STATIC PAGES
  // ============================================
  {
    path: '',
    component: LegalLayoutComponent,
    children: [
      { path: 'privacy', component: PrivacyComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'about', component: AboutComponent },
      { path: 'cookies', component: CookiesComponent }
    ]
  },

  // Catch-all
  { path: '**', redirectTo: '/auth/login' }
];