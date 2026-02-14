import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServicioCancion {
  id: number;
  servicioId: number;
  cancionId: number;
  cancionNombre: string | null;
  cancionAutor: string | null;
  cancionEnlace: string | null;
  director1Id: number | null;
  director1Nombre: string | null;
  director2Id: number | null;
  director2Nombre: string | null;
}

@Injectable({ providedIn: 'root' })
export class ServicioCancionService {
  private baseUrl = `${environment.apiUrl}/api/servicio`;

  constructor(private http: HttpClient) {}

  getByServicio(servicioId: number): Observable<ServicioCancion[]> {
    return this.http.get<ServicioCancion[]>(`${this.baseUrl}/${servicioId}/canciones`);
  }

  create(servicioId: number, body: { cancionId: number; director1Id?: number | null; director2Id?: number | null }): Observable<ServicioCancion> {
    return this.http.post<ServicioCancion>(`${this.baseUrl}/${servicioId}/canciones`, body);
  }

  update(servicioId: number, id: number, body: { director1Id?: number | null; director2Id?: number | null }): Observable<ServicioCancion> {
    return this.http.put<ServicioCancion>(`${this.baseUrl}/${servicioId}/canciones/${id}`, body);
  }

  delete(servicioId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${servicioId}/canciones/${id}`);
  }
}
