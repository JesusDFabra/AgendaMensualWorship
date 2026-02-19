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
  /** Desglose de fecha de nacimiento para los selectores (día 1-31, mes 1-12, año). */
  birthDay: number | null = null;
  birthMonth: number | null = null;
  birthYear: number | null = null;

  /** Años disponibles para fecha de nacimiento (desde 1940 hasta año actual). */
  readonly birthYears: number[] = (() => {
    const current = new Date().getFullYear();
    const arr: number[] = [];
    for (let y = current; y >= 1940; y--) arr.push(y);
    return arr;
  })();
  readonly birthMonths = [
    { value: 1, label: 'Enero', short: 'Ene' }, { value: 2, label: 'Febrero', short: 'Feb' }, { value: 3, label: 'Marzo', short: 'Mar' },
    { value: 4, label: 'Abril', short: 'Abr' }, { value: 5, label: 'Mayo', short: 'May' }, { value: 6, label: 'Junio', short: 'Jun' },
    { value: 7, label: 'Julio', short: 'Jul' }, { value: 8, label: 'Agosto', short: 'Ago' }, { value: 9, label: 'Septiembre', short: 'Sep' },
    { value: 10, label: 'Octubre', short: 'Oct' }, { value: 11, label: 'Noviembre', short: 'Nov' }, { value: 12, label: 'Diciembre', short: 'Dic' },
  ];
  readonly birthDays = Array.from({ length: 31 }, (_, i) => i + 1);

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
          this.error = err?.message || 'No se pudieron cargar sexos y roles. Comprueba tu conexión o inténtalo más tarde.';
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
    this.parseFecNacimiento(this.fecNacimiento);
    this.sexoId = m.sexo?.id ?? null;
    this.correo = m.correo ?? null;
    this.celular = m.celular ?? null;
    this.rolId = m.rol?.id ?? null;
    this.activo = m.activo ?? true;
    this.observaciones = m.observaciones ?? null;
  }

  /** Construye YYYY-MM-DD desde día, mes, año; devuelve '' si falta algo o la fecha no es válida. */
  private buildFecNacimiento(): string {
    const d = this.birthDay;
    const m = this.birthMonth;
    const y = this.birthYear;
    if (d == null || m == null || y == null) return '';
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return '';
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  private parseFecNacimiento(value: string): void {
    if (!value || value.length < 10) {
      this.birthDay = null;
      this.birthMonth = null;
      this.birthYear = null;
      return;
    }
    const parts = value.slice(0, 10).split('-');
    if (parts.length !== 3) return;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return;
    if (m < 1 || m > 12 || d < 1 || d > 31) return;
    this.birthYear = y;
    this.birthMonth = m;
    this.birthDay = d;
  }

  submit(): void {
    this.error = null;
    this.saving = true;

    this.fecNacimiento = this.buildFecNacimiento();
    if (!this.fecNacimiento) {
      this.saving = false;
      this.error = 'Selecciona una fecha de nacimiento válida (día, mes y año).';
      return;
    }

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
