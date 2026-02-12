import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServicioService, Servicio } from '../../../core/services/servicio.service';
import { AsignacionService, Asignacion } from '../../../core/services/asignacion.service';
import { Member } from '../../../core/services/member.service';
import { AGENDA_SLOTS } from '../agenda-slots';

type SlotState = {
  label: string;
  rolId: number;
  asignacion: Asignacion | null;
};

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss',
})
export class ServiceDetailComponent implements OnInit {
  servicioId = signal<number | null>(null);
  servicio = signal<Servicio | null>(null);
  asignaciones = signal<Asignacion[]>([]);
  loading = signal(true);
  notFound = signal(false);
  /** Slot index (in AGENDA_SLOTS) for which we're showing the dropdown */
  selectingSlot = signal<number | null>(null);
  disponibles = signal<Member[]>([]);
  loadingDisponibles = signal(false);
  updating = signal<string | null>(null); // 'add' | 'remove' | null

  /** Para cada slot (por índice), la asignación correspondiente. Voz 1..5 se mapean por orden. */
  slots = computed<SlotState[]>(() => {
    const list = this.asignaciones();
    const result: SlotState[] = [];
    const voces = list.filter(a => a.rolId === 5);
    let vozIndex = 0;
    for (let i = 0; i < AGENDA_SLOTS.length; i++) {
      const { label, rolId } = AGENDA_SLOTS[i];
      let asignacion: Asignacion | null = null;
      if (rolId === 5) {
        asignacion = voces[vozIndex] ?? null;
        vozIndex++;
      } else {
        asignacion = list.find(a => a.rolId === rolId) ?? null;
      }
      result.push({ label, rolId, asignacion });
    }
    return result;
  });

  constructor(
    private route: ActivatedRoute,
    private servicioService: ServicioService,
    private asignacionService: AsignacionService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    const numId = +id;
    if (Number.isNaN(numId)) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.servicioId.set(numId);
    this.loadServicio();
    this.loadAsignaciones();
  }

  private loadServicio(): void {
    const id = this.servicioId();
    if (id == null) return;
    this.servicioService.getById(id).subscribe({
      next: (s) => {
        this.servicio.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadAsignaciones(): void {
    const id = this.servicioId();
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
    const sid = this.servicioId();
    if (sid == null) return;
    const slot = this.slots()[slotIndex];
    this.selectingSlot.set(slotIndex);
    this.loadingDisponibles.set(true);
    this.asignacionService.getDisponibles(sid, slot.rolId).subscribe({
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
    const sid = this.servicioId();
    if (sid == null) return;
    this.updating.set('add');
    this.asignacionService.addAsignacion(sid, miembro.id).subscribe({
      next: () => {
        this.loadAsignaciones();
        this.closeSelector();
        this.updating.set(null);
      },
      error: () => this.updating.set(null),
    });
  }

  remove(slotIndex: number): void {
    const slot = this.slots()[slotIndex];
    const a = slot.asignacion;
    if (!a) return;
    const sid = this.servicioId();
    if (sid == null) return;
    this.updating.set('remove');
    this.asignacionService.removeAsignacion(sid, a.miembroId).subscribe({
      next: () => {
        this.loadAsignaciones();
        this.updating.set(null);
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
