import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  MemberService,
  Sexo,
  Rol,
  CreateMemberPayload,
} from '../../../core/services/member.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.scss',
})
export class MemberFormComponent implements OnInit {
  @Input() isModal = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  sexos: Sexo[] = [];
  roles: Rol[] = [];
  loading = true;
  saving = false;
  error: string | null = null;

  nombre = '';
  apellido = '';
  alias: string | null = null;
  identificacion = '';
  fecNacimiento = '';
  sexoId: number | null = null;
  correo: string | null = null;
  celular: string | null = null;
  rolId: number | null = null;
  activo = true;
  observaciones: string | null = null;

  constructor(
    private memberService: MemberService,
    private router: Router
  ) {}

  ngOnInit(): void {
    forkJoin({
      s: this.memberService.getSexos(),
      r: this.memberService.getRoles(),
    }).subscribe({
      next: ({ s, r }) => {
        this.sexos = Array.isArray(s) ? s : [];
        this.roles = Array.isArray(r) ? r : [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'No se pudieron cargar sexos y roles. ¿Está el backend en marcha (puerto 8081)?';
        this.loading = false;
      },
    });
  }

  submit(): void {
    this.error = null;
    this.saving = true;

    const payload: CreateMemberPayload = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      alias: this.alias?.trim() || null,
      identificacion: this.identificacion.trim(),
      fecNacimiento: this.fecNacimiento,
      sexo: this.sexoId != null ? { id: this.sexoId } : null,
      correo: this.correo?.trim() || null,
      celular: this.celular?.trim() || null,
      rol: this.rolId != null ? { id: this.rolId } : null,
      activo: this.activo,
      observaciones: this.observaciones?.trim() || null,
    };

    this.memberService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        if (this.isModal) {
          this.saved.emit();
        } else {
          this.router.navigate(['/miembros']);
        }
      },
      error: (err: unknown) => {
        this.saving = false;
        this.error = err instanceof Error ? err.message : 'Error al guardar el miembro.';
      },
    });
  }
}
