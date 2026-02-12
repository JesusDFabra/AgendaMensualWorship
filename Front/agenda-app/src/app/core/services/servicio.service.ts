import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Día de servicio en la iglesia (tabla servicio) */
export interface Servicio {
  id: number;
  fecha: string; // yyyy-MM-dd
  nombre: string | null;
  creadoEn?: string;
}

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private baseUrl = `${environment.apiUrl}/api/servicio`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.baseUrl);
  }

  getById(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.baseUrl}/${id}`);
  }

  /** Crea uno o más días de servicio. El backend ignora fechas que ya existen. */
  create(services: { fecha: string; nombre?: string }[]): Observable<Servicio[]> {
    return this.http.post<Servicio[]>(this.baseUrl, services);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
