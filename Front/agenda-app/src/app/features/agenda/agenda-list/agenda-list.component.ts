import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServicioService, Servicio } from '../../../core/services/servicio.service';
import { ServiceAssignmentFormComponent } from '../service-assignment-form/service-assignment-form.component';

type DayCell = { day: number | null; dateStr: string | null; servicio: Servicio | null };

@Component({
  selector: 'app-agenda-list',
  standalone: true,
  imports: [RouterLink, ServiceAssignmentFormComponent],
  templateUrl: './agenda-list.component.html',
  styleUrl: './agenda-list.component.scss',
})
export class AgendaListComponent implements OnInit {
  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth() + 1); // 1-12
  services = signal<Servicio[]>([]);
  loading = signal(true);
  /** Modal de asignación: al elegir un día con servicio */
  selectedServicio = signal<Servicio | null>(null);
  /** Pestaña activa en el modal (siempre visible en la cabecera) */
  modalTab = signal<'miembros' | 'canciones'>('miembros');
  /** Si hubo cambios en el modal (miembros o canciones) para recargar al cerrar */
  hasChangesInModal = false;

  private readonly monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  monthLabel = computed(() => {
    return `${this.monthNames[this.currentMonth() - 1]} ${this.currentYear()}`;
  });

  /** Grid 7 columnas: cada celda tiene day, dateStr, servicio (si hay servicio ese día) */
  calendarGrid = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const list = this.services();
    const byDate = new Map<string, Servicio>();
    list.forEach(s => byDate.set(s.fecha, s));

    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();

    const grid: DayCell[] = [];
    for (let i = 0; i < startWeekday; i++) {
      grid.push({ day: null, dateStr: null, servicio: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = this.toDateStr(year, month, d);
      grid.push({
        day: d,
        dateStr,
        servicio: byDate.get(dateStr) ?? null,
      });
    }
    const total = grid.length;
    const remainder = total % 7;
    const fill = remainder === 0 ? 0 : 7 - remainder;
    for (let i = 0; i < fill; i++) {
      grid.push({ day: null, dateStr: null, servicio: null });
    }
    return grid;
  });

  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  constructor(private servicioService: ServicioService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  private toDateStr(year: number, month: number, day: number): string {
    const m = month < 10 ? `0${month}` : `${month}`;
    const d = day < 10 ? `0${day}` : `${day}`;
    return `${year}-${m}-${d}`;
  }

  private loadServices(): void {
    this.loading.set(true);
    this.servicioService.getAll().subscribe({
      next: (list) => {
        this.services.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  prevMonth(): void {
    let y = this.currentYear();
    let m = this.currentMonth() - 1;
    if (m < 1) {
      m = 12;
      y--;
    }
    this.currentMonth.set(m);
    this.currentYear.set(y);
  }

  nextMonth(): void {
    let y = this.currentYear();
    let m = this.currentMonth() + 1;
    if (m > 12) {
      m = 1;
      y++;
    }
    this.currentMonth.set(m);
    this.currentYear.set(y);
  }

  openAssignmentModal(servicio: Servicio): void {
    this.selectedServicio.set(servicio);
  }

  closeAssignmentModal(): void {
    if (this.hasChangesInModal) {
      this.loadServices();
      this.hasChangesInModal = false;
    }
    this.selectedServicio.set(null);
    this.modalTab.set('miembros');
  }

  onServicioChanged(): void {
    this.hasChangesInModal = true;
  }

  setModalTab(tab: 'miembros' | 'canciones'): void {
    this.modalTab.set(tab);
  }

  formatDate(fecha: string): string {
    const d = new Date(fecha + 'T12:00:00');
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const weekday = weekdays[d.getDay()];
    return `${weekday} ${day}/${month}/${year}`;
  }
}
