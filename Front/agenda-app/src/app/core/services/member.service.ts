import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Sexo {
  id: number;
  descripcion: string;
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface Member {
  id: number;
  nombre: string;
  apellido: string;
  alias: string | null;
  identificacion: string;
  fecNacimiento: string;
  sexo: Sexo | null;
  correo: string | null;
  celular: string | null;
  rol: Rol | null;
  activo: boolean;
  observaciones: string | null;
}

/** Payload para crear un miembro (sin id) */
export interface CreateMemberPayload {
  nombre: string;
  apellido: string;
  alias: string | null;
  identificacion: string;
  fecNacimiento: string;
  sexo: { id: number } | null;
  correo: string | null;
  celular: string | null;
  rol: { id: number } | null;
  activo: boolean;
  observaciones: string | null;
}

@Injectable({ providedIn: 'root' })
export class MemberService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.baseUrl}/api/miembros`);
  }

  getById(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.baseUrl}/api/miembros/${id}`);
  }

  getSexos(): Observable<Sexo[]> {
    return this.http.get<Sexo[]>(`${this.baseUrl}/api/sexos`);
  }

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/api/roles`);
  }

  create(payload: CreateMemberPayload): Observable<Member> {
    return this.http.post<Member>(`${this.baseUrl}/api/miembros`, payload);
  }

  update(id: number, member: Member): Observable<Member> {
    return this.http.put<Member>(`${this.baseUrl}/api/miembros/${id}`, member);
  }
}
