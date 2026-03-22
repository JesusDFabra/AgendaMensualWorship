import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Paleta de 4 colores (tabla paleta_colores). */
export interface PaletaColores {
  id: number;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

/** Día de servicio en la iglesia (tabla servicio) */
export interface Servicio {
  id: number;
  fecha: string; // yyyy-MM-dd
  nombre: string | null;
  creadoEn?: string;
  /** FK opcional hacia paleta_colores (null = sin paleta, cuadros transparentes). */
  paletaColores?: PaletaColores | null;
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

  /** Asigna o quita la paleta del servicio (guardado inmediato en backend). */
  setPaleta(servicioId: number, paletaId: number | null): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.baseUrl}/${servicioId}/paleta`, { paletaId });
  }
}
