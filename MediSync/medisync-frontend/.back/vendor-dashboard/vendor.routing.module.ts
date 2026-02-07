// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';

// import { HomeComponent } from './pages/home/hom'
// import { DashboardComponent } from '../dashboard/vendor-dashboard.component';
// import { RfqsComponent } from './pages/rfqs/rfqs.component';
// import { RfqDetailComponent } from './pages/rfq-detail/rfq-detail.component';
// import { QuotationsComponent } from './pages/quotations/quotations.component';
// import { QuotationDetailComponent } from './pages/quotation-detail/quotation-detail.component';
// import { DeliveriesComponent } from './pages/deliveries/deliveries.component';
// import { DeliveryDetailComponent } from './pages/delivery-detail/delivery-detail.component';
// import { SupportComponent } from './pages/support/support.component';
// import { TicketDetailComponent } from './pages/ticket-detail/ticket-detail.component';
// import { SearchComponent } from './pages/search/search.component';
// import { ProfileComponent } from './pages/profile/profile.component';

// const routes: Routes = [
//   { path: '', pathMatch: 'full', redirectTo: 'Home' },
//   { path: 'Home', component: HomeComponent },
//   { path: 'dashboard', component: DashboardComponent },
//   { path: 'compliance', loadChildren: () => import('./pages/compliance/compliance.module').then(m => m.ComplianceModule) }, // sample lazy
//   { path: 'rfqs', component: RfqsComponent },
//   { path: 'rfqs/:id', component: RfqDetailComponent },
//   { path: 'quotations', component: QuotationsComponent },
//   { path: 'quotations/:id', component: QuotationDetailComponent },
//   { path: 'deliveries', component: DeliveriesComponent },
//   { path: 'deliveries/:id', component: DeliveryDetailComponent },
//   { path: 'support', component: SupportComponent },
//   { path: 'tickets/:id', component: TicketDetailComponent },
//   { path: 'search', component: SearchComponent },
//   { path: 'profile', component: ProfileComponent },
//   { path: '**', redirectTo: 'Home' },
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
//   exports: [RouterModule]
// })
// export class AppRoutingModule {}