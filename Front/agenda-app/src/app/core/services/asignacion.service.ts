import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Member } from './member.service';

export interface Asignacion {
  id: number;
  servicioId: number;
  miembroId: number;
  nombreCompleto: string;
  alias: string | null;
  rolNombre: string;
  rolId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AsignacionService {
  private baseUrl = `${environment.apiUrl}/api/servicio`;

  constructor(private http: HttpClient) {}

  getAsignaciones(servicioId: number): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.baseUrl}/${servicioId}/asignaciones`);
  }

  getDisponibles(servicioId: number, rolId: number): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.baseUrl}/${servicioId}/disponibles`, {
      params: { rolId: rolId.toString() },
    });
  }

  addAsignacion(servicioId: number, miembroId: number): Observable<Asignacion> {
    return this.http.post<Asignacion>(`${this.baseUrl}/${servicioId}/asignaciones`, { miembroId });
  }

  removeAsignacion(servicioId: number, miembroId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${servicioId}/asignaciones/${miembroId}`);
  }
}
