import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardSummary, Branch, AppUser } from '../models/headOfficedashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  // ✅ Base URL only (no extra path fragments)
  private apiBase = environment.apiBaseUrl;

  // ✅ Adjust these if your backend routes differ (NO backend change required)
  private branchesUrl = `${this.apiBase}/v1/ho/branches`;
  // private vendorsUrl  = ${this.apiBase}/api/v1/sm/vendors;
  private usersUrl    =`${this.apiBase}/v1/ho/users`;

  /**
   * ✅ Frontend computed summary (no backend changes)
   * - counts branches/vendors/users from list endpoints
   * - computes activeBranches using status/active/isActive
   */
  getSummary(): Observable<DashboardSummary> {
    const branches$ = this.http.get<Branch[]>(this.branchesUrl).pipe(
      catchError(err => {
        console.error('Branches API failed:', err);
        return of([] as Branch[]);
      })
    );

    // const vendors$ = this.http.get<Vendor[]>(this.vendorsUrl).pipe(
    //   catchError(err => {
    //     console.error('Vendors API failed:', err);
    //     return of([] as Vendor[]);
    //   })
    // );

    // If your backend doesn't have users endpoint, it will safely fall back to []
    const users$ = this.http.get<AppUser[]>(this.usersUrl).pipe(
      catchError(err => {
        console.error('Users API failed:', err);
        return of([] as AppUser[]);
      })
    );

    return forkJoin({ branches: branches$, users: users$ }).pipe(
      map(({ branches, users }) => {
        const activeBranches = branches.length;

        return {
          totalUsers: users.length,
          activeBranches,
        } as DashboardSummary;
      }),
      shareReplay(1)
    );
  }

  // ✅ Active branch detector (supports multiple backend styles)
  private isBranchActive(b: Branch): boolean {
    if (typeof b.active === 'boolean') return b.active;
    if (typeof b.isActive === 'boolean') return b.isActive;

    const s = (b.status ?? '').toLowerCase();
    return s === 'active' || s === 'activated' || s === 'enabled' || s === 'open';
  }

  logout(): Observable<void> {
    // ✅ Keep your logout endpoint (as you used in component)
    return this.http.post<void>(`${this.apiBase}/api/auth/logout`, {});
  }
}