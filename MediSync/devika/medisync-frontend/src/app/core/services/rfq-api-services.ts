import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RfqDto, RfqPayloadDto } from '../models/rfq.model';

@Injectable({ providedIn: 'root' })
export class RfqApiService {
  private base = `${environment.apiBaseUrl}/v1/sm/rfqs`;

  constructor(private http: HttpClient) {}

  // -------------------------
  // Normalizers (fix API mismatch)
  // -------------------------
  private pickListArray(resp: any): any[] {
    if (Array.isArray(resp)) return resp;

    // common wrappers
    if (Array.isArray(resp?.content)) return resp.content; // Spring pageable
    if (Array.isArray(resp?.data)) return resp.data;
    if (Array.isArray(resp?.rfqs)) return resp.rfqs;
    if (Array.isArray(resp?.items)) return resp.items;

    return [];
  }

  private normalizeRfq(obj: any): RfqDto {
    // handle nested shapes like { rfq: {...} }
    const r = obj?.rfq ?? obj ?? {};

    const rfqId =
      r?.rfqId ?? r?.rfq_id ?? r?.id ?? r?.rfqID ?? undefined;

    const createdBy =
      r?.createdBy ?? r?.created_by ?? r?.createdBY ?? undefined;

    const statusAward =
      r?.statusAward ?? r?.status_award ?? r?.status ?? '';

    const submissionDeadline =
      r?.submissionDeadline ?? r?.submission_deadline ?? r?.submissionDate ?? '';

    const expectedDeliveryDate =
      r?.expectedDeliveryDate ?? r?.expected_delivery_date ?? r?.expectedDate ?? '';

    // keep any other fields too
    return {
      ...(r as any),
      rfqId: rfqId != null ? Number(rfqId) : undefined,
      createdBy: createdBy != null ? Number(createdBy) : (r as any)?.createdBy,
      statusAward: (statusAward ?? '').toString(),
      submissionDeadline: (submissionDeadline ?? '').toString(),
      expectedDeliveryDate: (expectedDeliveryDate ?? '').toString(),
    } as RfqDto;
  }

  // -------------------------
  // API methods
  // -------------------------
  list(filters?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    createdBy?: number; // kept for compatibility
    q?: string;
  }): Observable<RfqDto[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          params = params.set(k, String(v));
        }
      });
    }

    return this.http.get<any>(this.base, { params }).pipe(
      map((resp: any) => {
        const arr = this.pickListArray(resp);
        return arr.map((x: any) => this.normalizeRfq(x));
      })
    );
  }

  getById(id: number): Observable<RfqPayloadDto> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(
      map((payload: any) => {
        // Some backends return { rfq: {...}, items: [...] }
        // Some return { ...rfqFields, items: [...] }
        const rfqPart = payload?.rfq ?? payload ?? {};
        const rfq = this.normalizeRfq(rfqPart) as any;

        const items = Array.isArray(payload?.items) ? payload.items : [];
        const normalizedItems = items.map((i: any) => ({
          rfqItemId: i.rfqItemId ?? i.rfq_item_id ?? undefined,
          rfqItemName: (
            i.rfqItemName ??
            i.rfq_item_name ??
            i.itemName ??
            i.item_name ??
            ''
          ).toString(),
          quantityNeeded: Number(i.quantityNeeded ?? i.quantity_needed ?? i.qty ?? 0),
        }));

        return {
          rfq,
          items: normalizedItems,
        } as RfqPayloadDto;
      })
    );
  }

  create(payload: RfqPayloadDto): Observable<RfqPayloadDto> {
    return this.http.post<RfqPayloadDto>(this.base, payload);
  }

  update(id: number, payload: RfqPayloadDto): Observable<RfqPayloadDto> {
    return this.http.put<RfqPayloadDto>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  award(id: number, status: string) {
    const params = new HttpParams().set('status', status);
    return this.http.put<RfqDto>(`${this.base}/${id}/award`, null, { params }).pipe(
      map((r: any) => this.normalizeRfq(r))
    );
  }
}