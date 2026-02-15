import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServicioService, Servicio } from '../../core/services/servicio.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';

type DayCell = { day: number | null; dateStr: string | null; servicio: Servicio | null };

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth() + 1); // 1-12
  services = signal<Servicio[]>([]);
  loading = signal(true);
  updating = signal<string | null>(null); // dateStr being toggled

  constructor(
    private servicioService: ServicioService,
    public adminAuth: AdminAuthService,
  ) {}

  private readonly monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  monthLabel = computed(() => {
    return `${this.monthNames[this.currentMonth() - 1]} ${this.currentYear()}`;
  });

  /** Grid 6x7: each cell is { day, dateStr, servicio } */
  calendarGrid = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const list = this.services();
    const byDate = new Map<string, Servicio>();
    list.forEach(s => byDate.set(s.fecha, s));

    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    const startWeekday = first.getDay(); // 0 = domingo
    const daysInMonth = last.getDate();

    const grid: DayCell[] = [];
    const padding = startWeekday;
    for (let i = 0; i < padding; i++) {
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

  toggleDay(cell: DayCell): void {
    if (cell.day === null || cell.dateStr === null) return;
    if (this.updating()) return;

    this.updating.set(cell.dateStr);
    if (cell.servicio) {
      this.servicioService.deleteById(cell.servicio.id).subscribe({
        next: () => {
          this.services.update(list => list.filter(s => s.id !== cell.servicio!.id));
          this.updating.set(null);
        },
        error: () => this.updating.set(null),
      });
    } else {
      this.servicioService.create([{ fecha: cell.dateStr }]).subscribe({
        next: (created) => {
          this.services.update(list => [...list, ...created]);
          this.updating.set(null);
        },
        error: () => this.updating.set(null),
      });
    }
  }

  isUpdating(dateStr: string | null): boolean {
    return dateStr !== null && this.updating() === dateStr;
  }
}
