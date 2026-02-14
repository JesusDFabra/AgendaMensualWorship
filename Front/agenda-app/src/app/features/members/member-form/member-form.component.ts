import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  MemberService,
  Member,
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
  /** Si se define, el formulario carga el miembro y al guardar hace update en lugar de create. */
  @Input() memberId: number | null = null;
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
    const loadCatalog = forkJoin({
      s: this.memberService.getSexos(),
      r: this.memberService.getRoles(),
    });
    if (this.memberId) {
      forkJoin({
        catalog: loadCatalog,
        member: this.memberService.getById(this.memberId),
      }).subscribe({
        next: ({ catalog, member }) => {
          this.sexos = Array.isArray(catalog.s) ? catalog.s : [];
          this.roles = Array.isArray(catalog.r) ? catalog.r : [];
          this.patchFormFromMember(member);
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.message || 'No se pudo cargar el miembro o el catálogo.';
          this.loading = false;
        },
      });
    } else {
      loadCatalog.subscribe({
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
  }

  private patchFormFromMember(m: Member): void {
    this.nombre = m.nombre ?? '';
    this.apellido = m.apellido ?? '';
    this.alias = m.alias ?? null;
    this.identificacion = m.identificacion ?? '';
    this.fecNacimiento = m.fecNacimiento ?? '';
    this.sexoId = m.sexo?.id ?? null;
    this.correo = m.correo ?? null;
    this.celular = m.celular ?? null;
    this.rolId = m.rol?.id ?? null;
    this.activo = m.activo ?? true;
    this.observaciones = m.observaciones ?? null;
  }

  submit(): void {
    this.error = null;
    this.saving = true;

    if (this.memberId != null) {
      const member: Member = {
        id: this.memberId,
        nombre: this.nombre.trim(),
        apellido: this.apellido.trim(),
        alias: this.alias?.trim() || null,
        identificacion: this.identificacion.trim(),
        fecNacimiento: this.fecNacimiento,
        sexo: this.sexoId != null ? { id: this.sexoId, descripcion: '' } : null,
        correo: this.correo?.trim() || null,
        celular: this.celular?.trim() || null,
        rol: this.rolId != null ? { id: this.rolId, nombre: '' } : null,
        activo: this.activo,
        observaciones: this.observaciones?.trim() || null,
      };
      this.memberService.update(this.memberId, member).subscribe({
        next: () => {
          this.saving = false;
          this.saved.emit();
        },
        error: (err: unknown) => {
          this.saving = false;
          this.error = err instanceof Error ? err.message : 'Error al actualizar el miembro.';
        },
      });
      return;
    }

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
