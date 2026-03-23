import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaletaColores } from './servicio.service';

export interface PaletaColoresBody {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

@Injectable({ providedIn: 'root' })
export class PaletaColoresService {
  private baseUrl = `${environment.apiUrl}/api/paleta-colores`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PaletaColores[]> {
    return this.http.get<PaletaColores[]>(this.baseUrl);
  }

  create(body: PaletaColoresBody): Observable<PaletaColores> {
    return this.http.post<PaletaColores>(this.baseUrl, body);
  }

  update(id: number, body: PaletaColoresBody): Observable<PaletaColores> {
    return this.http.put<PaletaColores>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
