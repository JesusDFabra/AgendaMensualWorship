import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaletaColores } from './servicio.service';

@Injectable({ providedIn: 'root' })
export class PaletaColoresService {
  private baseUrl = `${environment.apiUrl}/api/paleta-colores`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PaletaColores[]> {
    return this.http.get<PaletaColores[]>(this.baseUrl);
  }
}
