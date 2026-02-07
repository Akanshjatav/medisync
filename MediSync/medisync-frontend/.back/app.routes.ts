import { Routes } from '@angular/router';

import { CommonLayoutComponent } from '../app/layouts/common-layout/common-layout.component';
import { AuthLayoutComponent } from '../app/layouts/auth-layout/auth-layout.component';

import { VendorProfileComponent } from '../app/pages/vendor-profile/vendor-profile.component';
import { LoginComponent } from '../app/pages/login/login.component';
import { ForgotPasswordComponent } from '../app/pages/forgot-password/forgot-password.component';
import { StoreManagerDashboardComponent } from '../app/pages/store-manager-dashboard/store-manager-dashboard.component';
// If you already have these, import them; otherwise create later or remove routes temporarily
// import { HomeComponent } from './pages/home/home.component';
// import { AboutComponent } from './pages/about/about.component';
// import { ServicesComponent } from './pages/services/services.component';
// import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  /**
   * AUTH FRAME: header + mini navbar + footer (NO sidebar)
   */
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },

      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },

      // Optional routes for the mini navbar (enable when components exist)
      // { path: 'home', component: HomeComponent },
      // { path: 'about', component: AboutComponent },
      // { path: 'services', component: ServicesComponent },
      // { path: 'register', component: RegisterComponent },
    ]
  },

  /**
   * APP FRAME: header + sidebar + footer (your existing layout)
   */
  {
    path: '',
    component: CommonLayoutComponent,
    children: [
      { path: 'vendor-profile', component: VendorProfileComponent },

      // keep your existing fallback if needed
      { path: 'dashboard', redirectTo: 'vendor-profile', pathMatch: 'full' },
      { path: 'store-manager-dashboard', component: StoreManagerDashboardComponent },
      // add other app pages here...
      // { path: 'inventory', component: InventoryComponent },
    ]
  },

  // Catch-all
  { path: '**', redirectTo: 'login' }
];