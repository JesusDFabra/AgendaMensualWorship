import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DevocionalDto {
  servicioId: number;
  miembroId: number | null;
  miembroAlias: string | null;
  miembroNombreCompleto: string | null;
}

@Injectable({ providedIn: 'root' })
export class DevocionalService {
  private baseUrl = `${environment.apiUrl}/api/servicio`;

  constructor(private http: HttpClient) {}

  getByServicio(servicioId: number): Observable<DevocionalDto> {
    return this.http.get<DevocionalDto>(`${this.baseUrl}/${servicioId}/devocional`);
  }

  setByServicio(servicioId: number, miembroId: number): Observable<DevocionalDto> {
    return this.http.put<DevocionalDto>(`${this.baseUrl}/${servicioId}/devocional`, { miembroId });
  }

  clearByServicio(servicioId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${servicioId}/devocional`);
  }
}

