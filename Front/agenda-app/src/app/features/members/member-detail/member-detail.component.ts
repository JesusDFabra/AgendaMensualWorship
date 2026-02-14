import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MemberService, Member } from '../../../core/services/member.service';
import { ServicioService, Servicio } from '../../../core/services/servicio.service';
import { NovedadService, Novedad } from '../../../core/services/novedad.service';
import { MemberFormComponent } from '../member-form/member-form.component';

type NovedadDayCell = { day: number | null; dateStr: string | null; servicio: Servicio | null };

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MemberFormComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss',
})
export class MemberDetailComponent implements OnInit {
  member: Member | null = null;
  loading = true;
  error: string | null = null;
  notFound = false;
  updatingActivo = false;
  showConfirmActivo = false;
  confirmActivoDocumento = '';
  confirmActivoError: string | null = null;

  showNovedadModal = false;
  novedadDocumento = '';
  novedadDocError: string | null = null;
  novedadCalendarVisible = false;
  servicios: Servicio[] = [];
  novedades: Novedad[] = [];
  loadingNovedades = false;
  updatingNovedadServicioId: number | null = null;
  novedadCalendarYear = signal(new Date().getFullYear());
  novedadCalendarMonth = signal(new Date().getMonth() + 1);
  showMotivoForNovedad: Novedad | null = null;
  motivoTexto = '';
  savingMotivo = false;

  showEditModal = false;
  editDocumento = '';
  editDocError: string | null = null;
  editUnlocked = false;

  private readonly monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  novedadMonthLabel = computed(() =>
    `${this.monthNames[this.novedadCalendarMonth() - 1]} ${this.novedadCalendarYear()}`
  );

  novedadCalendarGrid = computed(() => {
    const year = this.novedadCalendarYear();
    const month = this.novedadCalendarMonth();
    const byDate = new Map<string, Servicio>();
    this.servicios.forEach((s) => byDate.set(s.fecha, s));
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();
    const grid: NovedadDayCell[] = [];
    for (let i = 0; i < startWeekday; i++) grid.push({ day: null, dateStr: null, servicio: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push({ day: d, dateStr, servicio: byDate.get(dateStr) ?? null });
    }
    const remainder = grid.length % 7;
    const fill = remainder === 0 ? 0 : 7 - remainder;
    for (let i = 0; i < fill; i++) grid.push({ day: null, dateStr: null, servicio: null });
    return grid;
  });

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService,
    private servicioService: ServicioService,
    private novedadService: NovedadService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      this.loading = false;
      return;
    }
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      this.notFound = true;
      this.loading = false;
      return;
    }
    this.memberService.getById(numId).subscribe({
      next: (data) => {
        this.member = data;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      },
    });
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('es');
  }

  openConfirmActivo(): void {
    this.showConfirmActivo = true;
    this.confirmActivoDocumento = '';
    this.confirmActivoError = null;
  }

  closeConfirmActivo(): void {
    this.showConfirmActivo = false;
    this.confirmActivoDocumento = '';
    this.confirmActivoError = null;
  }

  confirmAndToggleActivo(): void {
    if (!this.member) return;
    const docIngresado = this.confirmActivoDocumento.trim();
    const docCorrecto = String(this.member.identificacion ?? '').trim();
    const esAdmin = docIngresado.toLowerCase() === 'admin';
    if (!esAdmin && docIngresado !== docCorrecto) {
      this.confirmActivoError = 'El número de documento no coincide.';
      return;
    }
    this.confirmActivoError = null;
    this.updatingActivo = true;
    const updated = { ...this.member, activo: !this.member.activo };
    this.memberService.update(this.member.id, updated).subscribe({
      next: (data) => {
        this.member = data;
        this.updatingActivo = false;
        this.closeConfirmActivo();
      },
      error: () => {
        this.updatingActivo = false;
      },
    });
  }

  onToggleActivoClick(): void {
    this.openConfirmActivo();
  }

  openNovedadModal(): void {
    this.showNovedadModal = true;
    this.novedadDocumento = '';
    this.novedadDocError = null;
  }

  closeNovedadModal(): void {
    this.showNovedadModal = false;
    this.novedadDocumento = '';
    this.novedadDocError = null;
  }

  closeNovedadCalendar(): void {
    this.novedadCalendarVisible = false;
    this.servicios = [];
    this.novedades = [];
    this.updatingNovedadServicioId = null;
    this.showMotivoForNovedad = null;
    this.motivoTexto = '';
  }

  novedadPrevMonth(): void {
    let m = this.novedadCalendarMonth();
    let y = this.novedadCalendarYear();
    if (m === 1) {
      m = 12;
      y--;
    } else m--;
    this.novedadCalendarMonth.set(m);
    this.novedadCalendarYear.set(y);
  }

  novedadNextMonth(): void {
    let m = this.novedadCalendarMonth();
    let y = this.novedadCalendarYear();
    if (m === 12) {
      m = 1;
      y++;
    } else m++;
    this.novedadCalendarMonth.set(m);
    this.novedadCalendarYear.set(y);
  }

  confirmNovedadDocumento(): void {
    if (!this.member) return;
    const doc = this.novedadDocumento.trim();
    const correcto = String(this.member.identificacion ?? '').trim();
    const esAdmin = doc.toLowerCase() === 'admin';
    if (!esAdmin && doc !== correcto) {
      this.novedadDocError = 'El número de documento no coincide.';
      return;
    }
    this.novedadDocError = null;
    this.loadingNovedades = true;
    const today = new Date().toISOString().slice(0, 10);
    const limit = new Date();
    limit.setDate(limit.getDate() + 90);
    const limitStr = limit.toISOString().slice(0, 10);
    forkJoin({
      servicios: this.servicioService.getAll(),
      novedades: this.novedadService.getByMember(this.member.id),
    }).subscribe({
      next: ({ servicios, novedades }) => {
        this.novedades = novedades;
        const list = servicios
          .filter((s) => s.fecha >= today && s.fecha <= limitStr)
          .sort((a, b) => a.fecha.localeCompare(b.fecha));
        this.servicios = list;
        if (list.length > 0) {
          const [y, m] = list[0].fecha.split('-').map(Number);
        this.novedadCalendarYear.set(y);
        this.novedadCalendarMonth.set(m);
        }
        this.showNovedadModal = false;
        this.novedadCalendarVisible = true;
        this.loadingNovedades = false;
      },
      error: () => {
        this.loadingNovedades = false;
      },
    });
  }

  hasNovedadForServicio(servicioId: number): boolean {
    return this.novedades.some((n) => n.servicio?.id === servicioId);
  }

  getNovedadForServicio(servicioId: number): Novedad | undefined {
    return this.novedades.find((n) => n.servicio?.id === servicioId);
  }

  toggleNovedad(servicio: Servicio): void {
    if (!this.member) return;
    if (this.updatingNovedadServicioId !== null) return;
    const existing = this.getNovedadForServicio(servicio.id);
    if (existing) {
      this.updatingNovedadServicioId = servicio.id;
      this.novedadService.deleteById(existing.id).subscribe({
        next: () => {
          this.novedades = this.novedades.filter((n) => n.servicio?.id !== servicio.id);
          this.updatingNovedadServicioId = null;
        },
        error: () => {
          this.updatingNovedadServicioId = null;
        },
      });
    } else {
      this.updatingNovedadServicioId = servicio.id;
      this.novedadService
        .create({
          miembro: { id: this.member.id },
          servicio: { id: servicio.id },
        })
        .subscribe({
          next: (created) => {
            if (created.length > 0) {
              this.novedades = [...this.novedades, created[0]];
              // Modal motivo comentado por ahora: this.showMotivoForNovedad = created[0]; this.motivoTexto = '';
            }
            this.updatingNovedadServicioId = null;
          },
          error: () => {
            this.updatingNovedadServicioId = null;
          },
        });
    }
  }

  closeMotivoModal(): void {
    this.showMotivoForNovedad = null;
    this.motivoTexto = '';
  }

  saveMotivo(): void {
    const n = this.showMotivoForNovedad;
    if (!n || !this.member) return;
    this.savingMotivo = true;
    this.novedadService
      .update(n.id, {
        miembro: { id: this.member.id },
        servicio: { id: n.servicio?.id ?? 0 },
        observacion: this.motivoTexto.trim() || null,
      })
      .subscribe({
        next: (updated) => {
          this.novedades = this.novedades.map((x) => (x.id === updated.id ? updated : x));
          this.closeMotivoModal();
          this.savingMotivo = false;
        },
        error: () => {
          this.savingMotivo = false;
        },
      });
  }

  openEditModal(): void {
    this.showEditModal = true;
    this.editDocumento = '';
    this.editDocError = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editDocumento = '';
    this.editDocError = null;
  }

  confirmEditDocumento(): void {
    if (!this.member) return;
    const doc = this.editDocumento.trim();
    const correcto = String(this.member.identificacion ?? '').trim();
    const esAdmin = doc.toLowerCase() === 'admin';
    if (!esAdmin && doc !== correcto) {
      this.editDocError = 'El número de documento no coincide.';
      return;
    }
    this.editDocError = null;
    this.showEditModal = false;
    this.editUnlocked = true;
  }

  onMemberSaved(): void {
    if (!this.member) return;
    this.memberService.getById(this.member.id).subscribe({
      next: (data) => {
        this.member = data;
        this.editUnlocked = false;
      },
    });
  }
}
