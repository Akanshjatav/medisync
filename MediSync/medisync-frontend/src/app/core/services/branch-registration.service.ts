import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BranchCreatePayload {
  branchName: string;
  branchLocation: string;
  address: string;
}


@Injectable({ providedIn: 'root' })
export class branchregistration_service {
 
  private readonly url = 'http://localhost:7000/api/v1/ho/register-branch';

  constructor(private http: HttpClient) {}

  createBranch(payload: BranchCreatePayload): Observable<any> {
  return this.http.post(this.url, payload);
}
}