import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cancion {
  id: number;
  nombre: string;
  autor: string | null;
  enlace: string | null;
}

@Injectable({ providedIn: 'root' })
export class CancionService {
  private baseUrl = `${environment.apiUrl}/api/cancion`;

  constructor(private http: HttpClient) {}

  /** Lista canciones; opcionalmente filtra por nombre (q). */
  list(q?: string): Observable<Cancion[]> {
    let httpParams = new HttpParams();
    if (q != null && q.trim() !== '') {
      httpParams = httpParams.set('q', q.trim());
    }
    return this.http.get<Cancion[]>(this.baseUrl, { params: httpParams });
  }

  /** Obtiene una canción por id. */
  getById(id: number): Observable<Cancion> {
    return this.http.get<Cancion>(`${this.baseUrl}/${id}`);
  }

  /** Crea una canción en el catálogo. */
  create(body: { nombre: string; autor?: string | null; enlace?: string | null }): Observable<Cancion> {
    return this.http.post<Cancion>(this.baseUrl, body);
  }

  /** Actualiza una canción del catálogo. */
  update(id: number, body: { nombre: string; autor?: string | null; enlace?: string | null }): Observable<Cancion> {
    return this.http.put<Cancion>(`${this.baseUrl}/${id}`, body);
  }

  /** Elimina una canción del catálogo. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
