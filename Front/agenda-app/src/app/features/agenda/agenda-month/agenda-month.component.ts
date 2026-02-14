import { NgClass } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServicioService, Servicio } from '../../../core/services/servicio.service';
import { AsignacionService, Asignacion } from '../../../core/services/asignacion.service';
import { ServicioCancionService, ServicioCancion } from '../../../core/services/servicio-cancion.service';
import { ServiceAssignmentFormComponent } from '../service-assignment-form/service-assignment-form.component';
import { AGENDA_SLOTS } from '../agenda-slots';

type DayWithAsignaciones = {
  servicio: Servicio;
  asignaciones: Asignacion[];
  slots: { label: string; nombre: string | null; nombreCompleto: string | null }[];
  canciones: ServicioCancion[];
};

@Component({
  selector: 'app-agenda-month',
  standalone: true,
  imports: [NgClass, RouterLink, ServiceAssignmentFormComponent],
  templateUrl: './agenda-month.component.html',
  styleUrl: './agenda-month.component.scss',
})
export class AgendaMonthComponent implements OnInit {
  year = signal(0);
  month = signal(0);
  servicesInMonth = signal<DayWithAsignaciones[]>([]);
  loading = signal(true);
  selectedServicio = signal<Servicio | null>(null);
  modalTab = signal<'miembros' | 'canciones'>('miembros');
  /** Asignaciones ya cargadas del mes; se pasan al modal para no volver a pedirlas. */
  selectedInitialAsignaciones = signal<Asignacion[] | null>(null);
  /** True si en el modal se asignó o quitó a alguien; solo entonces recargamos el mes al cerrar. */
  hasChangesInModal = false;

  private readonly monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  monthLabel = computed(() => {
    const m = this.month();
    const y = this.year();
    if (!m || !y) return '';
    return `${this.monthNames[m - 1]} ${y}`;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicioService: ServicioService,
    private asignacionService: AsignacionService,
    private servicioCancionService: ServicioCancionService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const y = +(params.get('year') ?? 0);
      const m = +(params.get('month') ?? 0);
      if (y && m >= 1 && m <= 12) {
        this.year.set(y);
        this.month.set(m);
        this.loadMonth();
      } else {
        this.loading.set(false);
      }
    });
  }

  private loadMonth(): void {
    this.loading.set(true);
    const y = this.year();
    const m = this.month();
    const prefix = `${y}-${m < 10 ? '0' + m : m}-`;

    this.servicioService.getAll().subscribe({
      next: (all) => {
        const inMonth = all
          .filter(s => s.fecha.startsWith(prefix))
          .sort((a, b) => a.fecha.localeCompare(b.fecha));
        if (inMonth.length === 0) {
          this.servicesInMonth.set([]);
          this.loading.set(false);
          return;
        }
        forkJoin(inMonth.map(s => this.asignacionService.getAsignaciones(s.id))).subscribe({
          next: (asignacionesArrays) => {
            const result: DayWithAsignaciones[] = inMonth.map((servicio, i) => ({
              servicio,
              asignaciones: asignacionesArrays[i] ?? [],
              slots: this.asignacionesToSlots(asignacionesArrays[i] ?? []),
              canciones: [],
            }));
            this.servicesInMonth.set(result);
            this.loading.set(false);
            this.loadCancionesForMonth(inMonth);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  /** Carga canciones de cada servicio del mes y actualiza la lista (no bloquea si falla). */
  private loadCancionesForMonth(inMonth: Servicio[]): void {
    if (inMonth.length === 0) return;
    forkJoin(inMonth.map(s =>
      this.servicioCancionService.getByServicio(s.id).pipe(
        catchError(() => of<ServicioCancion[]>([]))
      )
    )).subscribe({
      next: (cancionesArrays) => {
        const current = this.servicesInMonth();
        if (current.length !== cancionesArrays.length) return;
        const updated = current.map((day, i) => ({
          ...day,
          canciones: cancionesArrays[i] ?? [],
        }));
        this.servicesInMonth.set(updated);
      },
    });
  }

  private asignacionesToSlots(list: Asignacion[]): { label: string; nombre: string | null; nombreCompleto: string | null }[] {
    const voces = list.filter(a => a.rolId === 5);
    let vozIndex = 0;
    return AGENDA_SLOTS.map(({ label, rolId }) => {
      let asignacion: Asignacion | undefined;
      if (rolId === 5) {
        asignacion = voces[vozIndex];
        vozIndex++;
      } else {
        asignacion = list.find(x => x.rolId === rolId);
      }
      const nombre = asignacion ? (asignacion.alias || asignacion.nombreCompleto) : null;
      const nombreCompleto = asignacion ? asignacion.nombreCompleto : null;
      return { label, nombre, nombreCompleto };
    });
  }

  /** Nombre del mes (ej. Febrero) */
  formatMonthName(fecha: string): string {
    const d = new Date(fecha + 'T12:00:00');
    return this.monthNames[d.getMonth()];
  }

  /** Día completo: nombre del día + número (ej. Domingo 15) */
  formatDayWithWeekday(fecha: string): string {
    const d = new Date(fecha + 'T12:00:00');
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const day = d.getDate();
    const weekday = weekdays[d.getDay()];
    return `${weekday} ${day}`;
  }

  formatDateLong(fecha: string): string {
    const d = new Date(fecha + 'T12:00:00');
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const weekday = weekdays[d.getDay()];
    return `${weekday} ${day}/${month}/${year}`;
  }

  openEdit(day: DayWithAsignaciones): void {
    this.selectedServicio.set(day.servicio);
    this.selectedInitialAsignaciones.set(day.asignaciones);
  }

  setModalTab(tab: 'miembros' | 'canciones'): void {
    this.modalTab.set(tab);
  }

  closeModal(): void {
    if (this.hasChangesInModal) {
      this.loadMonth();
      this.hasChangesInModal = false;
    }
    this.selectedServicio.set(null);
    this.selectedInitialAsignaciones.set(null);
    this.modalTab.set('miembros');
  }

  onAsignacionesChanged(): void {
    this.hasChangesInModal = true;
  }

  /** Texto directores para una canción del servicio. */
  directoresDisplay(c: ServicioCancion): string {
    const a = c.director1Nombre?.trim();
    const b = c.director2Nombre?.trim();
    if (a && b) return `${a} y ${b}`;
    if (a) return a;
    if (b) return b;
    return '—';
  }

  prevMonth(): void {
    let y = this.year();
    let m = this.month() - 1;
    if (m < 1) {
      m = 12;
      y--;
    }
    this.router.navigate(['/agenda', 'mes', y, m]);
  }

  nextMonth(): void {
    let y = this.year();
    let m = this.month() + 1;
    if (m > 12) {
      m = 1;
      y++;
    }
    this.router.navigate(['/agenda', 'mes', y, m]);
  }
}
