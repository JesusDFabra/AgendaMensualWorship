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

/** Servicio en el que está asignado un miembro (para su perfil). */
export interface ServicioAsignado {
  servicioId: number;
  fecha: string;
  nombreServicio: string | null;
  rolNombre: string | null;
}

@Injectable({ providedIn: 'root' })
export class AsignacionService {
  private baseUrl = `${environment.apiUrl}/api/servicio`;

  constructor(private http: HttpClient) {}

  getAsignaciones(servicioId: number): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.baseUrl}/${servicioId}/asignaciones`);
  }

  /** Servicios en los que está asignado un miembro (ordenados por fecha, para el perfil). */
  getServiciosByMiembro(miembroId: number): Observable<ServicioAsignado[]> {
    return this.http.get<ServicioAsignado[]>(`${this.baseUrl}/miembro/${miembroId}/servicios`);
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
