import { Component, EventEmitter, Input, OnChanges, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServicioService, Servicio } from '../../../core/services/servicio.service';
import { AsignacionService, Asignacion } from '../../../core/services/asignacion.service';
import { ServicioCancionService, ServicioCancion } from '../../../core/services/servicio-cancion.service';
import { AGENDA_SLOTS, SLOT_COLORS } from '../agenda-slots';
import { DevocionalService, DevocionalDto } from '../../../core/services/devocional.service';
import { paletteToHexArray } from '../palette-util';

type SlotState = {
  label: string;
  asignacion: Asignacion | null;
  border: string;
  bg: string;
};

@Component({
  selector: 'app-service-view-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-view-modal.component.html',
  styleUrl: './service-view-modal.component.scss',
})
export class ServiceViewModalComponent implements OnChanges {
  @Input() servicioId: number | null = null;
  @Output() closed = new EventEmitter<void>();

  servicio = signal<Servicio | null>(null);
  asignaciones = signal<Asignacion[]>([]);
  canciones = signal<ServicioCancion[]>([]);
  devocional = signal<DevocionalDto | null>(null);
  loading = signal(true);
  notFound = signal(false);

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
      result.push({ label, asignacion, border: colors.border, bg: colors.bg });
    }
    return result;
  });

  constructor(
    private servicioService: ServicioService,
    private asignacionService: AsignacionService,
    private servicioCancionService: ServicioCancionService,
    private devocionalService: DevocionalService,
  ) {}

  ngOnChanges(): void {
    const id = this.servicioId;
    if (id == null) return;
    this.loading.set(true);
    this.notFound.set(false);
    forkJoin({
      servicio: this.servicioService.getById(id),
      asignaciones: this.asignacionService.getAsignaciones(id),
      canciones: this.servicioCancionService.getByServicio(id),
      devocional: this.devocionalService.getByServicio(id).pipe(
        catchError(() =>
          of<DevocionalDto>({
            servicioId: id,
            miembroId: null,
            miembroAlias: null,
            miembroNombreCompleto: null,
          }),
        ),
      ),
    }).subscribe({
      next: ({ servicio, asignaciones, canciones, devocional }) => {
        this.servicio.set(servicio);
        this.asignaciones.set(asignaciones);
        this.canciones.set(canciones);
        this.devocional.set(devocional);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  close(): void {
    this.closed.emit();
  }

  formatDate(fecha: string): string {
    const d = new Date(fecha + 'T12:00:00');
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${weekdays[d.getDay()]} ${day}/${month}/${year}`;
  }

  directoresDisplay(c: ServicioCancion): string {
    const a = c.director1Nombre?.trim();
    const b = c.director2Nombre?.trim();
    if (a && b) return `${a} y ${b}`;
    if (a) return a;
    if (b) return b;
    return '—';
  }

  devocionalDisplay(): string {
    const d = this.devocional();
    if (!d || d.miembroId == null) return '—';
    return d.miembroAlias?.trim() || d.miembroNombreCompleto?.trim() || '—';
  }

  swatchesForServicio(s: Servicio): (string | null)[] {
    return paletteToHexArray(s.paletaColores);
  }

  /** Oculta Voz 4 y Voz 5 cuando no tienen asignación. */
  shouldShowViewSlot(slot: SlotState): boolean {
    const isOptionalVoice = slot.label === 'Voz 4' || slot.label === 'Voz 5';
    if (!isOptionalVoice) return true;
    return !!slot.asignacion;
  }
}
