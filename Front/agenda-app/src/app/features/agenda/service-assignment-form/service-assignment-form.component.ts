import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
  computed,
} from '@angular/core';
import { ServicioService, Servicio } from '../../../core/services/servicio.service';
import { AsignacionService, Asignacion } from '../../../core/services/asignacion.service';
import { Member } from '../../../core/services/member.service';
import { AGENDA_SLOTS, SLOT_COLORS } from '../agenda-slots';

type SlotState = {
  label: string;
  rolId: number;
  asignacion: Asignacion | null;
  border: string;
  bg: string;
};

@Component({
  selector: 'app-service-assignment-form',
  standalone: true,
  imports: [],
  templateUrl: './service-assignment-form.component.html',
  styleUrl: './service-assignment-form.component.scss',
})
export class ServiceAssignmentFormComponent implements OnInit, OnChanges {
  @Input() servicioId!: number;
  @Input() servicio: Servicio | null = null;
  @Input() showHeader = true;
  /** Si se pasa (p. ej. desde la vista del mes), se usan de inmediato y no se pide la lista al backend. */
  @Input() initialAsignaciones: Asignacion[] | null = null;
  /** Se emite cuando el usuario asigna o quita a alguien (para que el padre sepa si recargar). */
  @Output() asignacionesChanged = new EventEmitter<void>();

  servicioResolved = signal<Servicio | null>(null);
  asignaciones = signal<Asignacion[]>([]);
  loading = signal(true);
  notFound = signal(false);
  selectingSlot = signal<number | null>(null);
  disponibles = signal<Member[]>([]);
  loadingDisponibles = signal(false);
  updating = signal<string | null>(null);

  slots = computed<SlotState[]>(() => {
    const list = this.asignaciones();
    const result: SlotState[] = [];
    const voces = list.filter(a => a.rolId === 5);
    let vozIndex = 0;
    for (let i = 0; i < AGENDA_SLOTS.length; i++) {
      const { label, rolId } = AGENDA_SLOTS[i];
      const colors = SLOT_COLORS[i] ?? SLOT_COLORS[0];
      let asignacion: Asignacion | null = null;
      if (rolId === 5) {
        asignacion = voces[vozIndex] ?? null;
        vozIndex++;
      } else {
        asignacion = list.find(a => a.rolId === rolId) ?? null;
      }
      result.push({ label, rolId, asignacion, border: colors.border, bg: colors.bg });
    }
    return result;
  });

  constructor(
    private servicioService: ServicioService,
    private asignacionService: AsignacionService,
  ) {}

  ngOnInit(): void {
    this.resolveServicioAndLoad();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['servicioId'] || changes['servicio'] || changes['initialAsignaciones']) {
      this.resolveServicioAndLoad();
    }
  }

  private resolveServicioAndLoad(): void {
    const id = this.servicioId;
    if (id == null) return;
    this.closeSelector();
    if (this.servicio) {
      this.notFound.set(false);
      this.servicioResolved.set(this.servicio);
      if (this.initialAsignaciones != null) {
        this.asignaciones.set(this.initialAsignaciones);
        this.loading.set(false);
        return;
      }
      this.loading.set(false);
      this.loadAsignaciones();
      return;
    }
    this.loading.set(true);
    this.servicioService.getById(id).subscribe({
      next: (s) => {
        this.servicioResolved.set(s);
        this.loading.set(false);
        this.loadAsignaciones();
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadAsignaciones(): void {
    const id = this.servicioId;
    if (id == null) return;
    this.asignacionService.getAsignaciones(id).subscribe({
      next: (list) => this.asignaciones.set(list),
      error: () => {},
    });
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

  openSelector(slotIndex: number): void {
    const slot = this.slots()[slotIndex];
    this.selectingSlot.set(slotIndex);
    this.loadingDisponibles.set(true);
    this.asignacionService.getDisponibles(this.servicioId, slot.rolId).subscribe({
      next: (members) => {
        this.disponibles.set(members);
        this.loadingDisponibles.set(false);
      },
      error: () => this.loadingDisponibles.set(false),
    });
  }

  closeSelector(): void {
    this.selectingSlot.set(null);
    this.disponibles.set([]);
  }

  assign(slotIndex: number, miembro: Member): void {
    this.updating.set('add');
    this.asignacionService.addAsignacion(this.servicioId, miembro.id).subscribe({
      next: () => {
        this.loadAsignaciones();
        this.closeSelector();
        this.updating.set(null);
        this.asignacionesChanged.emit();
      },
      error: () => this.updating.set(null),
    });
  }

  remove(slotIndex: number): void {
    const slot = this.slots()[slotIndex];
    const a = slot.asignacion;
    if (!a) return;
    this.updating.set('remove');
    this.asignacionService.removeAsignacion(this.servicioId, a.miembroId).subscribe({
      next: () => {
        this.loadAsignaciones();
        this.updating.set(null);
        this.asignacionesChanged.emit();
      },
      error: () => this.updating.set(null),
    });
  }

  memberDisplay(m: Member): string {
    const n = (m.nombre ?? '').trim();
    const a = (m.apellido ?? '').trim();
    if (m.alias) return `${n} ${a}`.trim() ? `${n} ${a} («${m.alias}»)` : `«${m.alias}»`;
    return `${n} ${a}`.trim() || '—';
  }

  isSelecting(slotIndex: number): boolean {
    return this.selectingSlot() === slotIndex;
  }
}
