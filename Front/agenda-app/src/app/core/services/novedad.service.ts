import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Novedad: un miembro indica que no puede en un día de servicio (tabla novedades) */
export interface Novedad {
  id: number;
  miembro: { id: number };
  servicio: { id: number; fecha?: string };
  observacion?: string | null;
  fechaRegistro?: string;
}

@Injectable({ providedIn: 'root' })
export class NovedadService {
  private baseUrl = `${environment.apiUrl}/api/novedades`;

  constructor(private http: HttpClient) {}

  getByMember(miembroId: number): Observable<Novedad[]> {
    return this.http.get<Novedad[]>(`${this.baseUrl}?miembroId=${miembroId}`);
  }

  create(novedad: { miembro: { id: number }; servicio: { id: number }; observacion?: string }): Observable<Novedad[]> {
    return this.http.post<Novedad[]>(this.baseUrl, [novedad]);
  }

  update(id: number, body: { miembro: { id: number }; servicio: { id: number }; observacion?: string | null }): Observable<Novedad> {
    return this.http.put<Novedad>(`${this.baseUrl}/${id}`, body);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
