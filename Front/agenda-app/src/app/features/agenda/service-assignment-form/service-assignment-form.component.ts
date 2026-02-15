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
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ServicioService, Servicio } from '../../../core/services/servicio.service';
import { AsignacionService, Asignacion } from '../../../core/services/asignacion.service';
import { ServicioCancionService, ServicioCancion } from '../../../core/services/servicio-cancion.service';
import { CancionService, Cancion } from '../../../core/services/cancion.service';
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
  imports: [FormsModule],
  templateUrl: './service-assignment-form.component.html',
  styleUrl: './service-assignment-form.component.scss',
})
export class ServiceAssignmentFormComponent implements OnInit, OnChanges {
  @Input() servicioId!: number;
  @Input() servicio: Servicio | null = null;
  @Input() showHeader = true;
  /** Vista solo lectura: se muestran miembros y canciones pero no se pueden editar. */
  @Input() set readOnly(value: boolean) {
    this.readOnlySignal.set(!!value);
  }
  readOnlySignal = signal(false);
  /** Si se pasa (p. ej. desde la vista del mes), se usan de inmediato y no se pide la lista al backend. */
  @Input() initialAsignaciones: Asignacion[] | null = null;
  /** Se emite cuando el usuario modifica miembros (asignar/quitar) o canciones (agregar/editar/eliminar) para que el padre recargue. */
  @Output() asignacionesChanged = new EventEmitter<void>();
  /** Si el padre controla la pestaña (p. ej. en el modal), no se muestra la barra de pestañas aquí. */
  activeTabInput = signal<'miembros' | 'canciones' | null>(null);
  @Input() set activeTab(v: 'miembros' | 'canciones' | null) {
    this.activeTabInput.set(v ?? null);
  }
  @Output() tabChange = new EventEmitter<'miembros' | 'canciones'>();

  servicioResolved = signal<Servicio | null>(null);
  asignaciones = signal<Asignacion[]>([]);
  loading = signal(true);
  notFound = signal(false);
  selectingSlot = signal<number | null>(null);
  disponibles = signal<Member[]>([]);
  /** Texto del buscador al elegir miembro para un rol (filtra por nombre o alias). */
  memberSearchQuery = signal('');
  loadingDisponibles = signal(false);
  updating = signal<string | null>(null);

  /** Miembros disponibles filtrados por nombre o alias según memberSearchQuery. */
  filteredDisponibles = computed(() => {
    const q = this.memberSearchQuery().trim().toLowerCase();
    const list = this.disponibles();
    if (!q) return list;
    return list.filter((m) => {
      const nombre = (m.nombre ?? '').toLowerCase();
      const apellido = (m.apellido ?? '').toLowerCase();
      const alias = (m.alias ?? '').toLowerCase();
      const full = `${nombre} ${apellido}`.trim();
      return full.includes(q) || alias.includes(q) || nombre.includes(q) || apellido.includes(q);
    });
  });

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

  /** Voces asignadas ese día (para elegir quién dirige cada canción). */
  vocesAsignadas = computed(() => {
    return this.slots().filter(s => s.rolId === 5 && s.asignacion != null).map(s => ({
      id: s.asignacion!.miembroId,
      displayName: s.asignacion!.alias || s.asignacion!.nombreCompleto,
    }));
  });

  /** Pestaña activa cuando el componente la controla (sin input activeTab). */
  internalTab = signal<'miembros' | 'canciones'>('miembros');
  /** Pestaña efectiva: la que viene del padre o la interna. */
  effectiveTab = computed(() => this.activeTabInput() ?? this.internalTab());

  canciones = signal<ServicioCancion[]>([]);
  loadingCanciones = signal(false);
  savingCancion = signal(false);
  cancionError = signal<string | null>(null);
  editingCancionId = signal<number | null>(null);
  /** Búsqueda en el catálogo de canciones. */
  catalogSearch$ = new Subject<string>();
  catalogResults = signal<Cancion[]>([]);
  loadingSearch = signal(false);
  /** Canción seleccionada del catálogo (o null si va a agregar nueva). */
  selectedCancion = signal<Cancion | null>(null);
  /** Si true, muestra campos para crear nueva canción (autor, enlace). */
  addingNewSong = signal(false);
  formCancion = signal<{
    searchQuery: string;
    newAutor: string;
    newEnlace: string;
    director1Id: number | null;
    director2Id: number | null;
  }>({
    searchQuery: '',
    newAutor: '',
    newEnlace: '',
    director1Id: null,
    director2Id: null,
  });

  constructor(
    private servicioService: ServicioService,
    private asignacionService: AsignacionService,
    private servicioCancionService: ServicioCancionService,
    private cancionService: CancionService,
  ) {}

  /** Inicializa búsqueda de catálogo al escribir. */
  private initCatalogSearch(): void {
    this.catalogSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        this.loadingSearch.set(true);
        return this.cancionService.list(q || undefined);
      }),
    ).subscribe({
      next: list => {
        this.catalogResults.set(list);
        this.loadingSearch.set(false);
      },
      error: () => this.loadingSearch.set(false),
    });
  }

  ngOnInit(): void {
    this.resolveServicioAndLoad();
    this.initCatalogSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['servicioId'] || changes['servicio'] || changes['initialAsignaciones']) {
      this.resolveServicioAndLoad();
    }
    if (changes['activeTab'] && this.activeTabInput() === 'canciones') {
      this.loadCanciones();
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
        this.loadCanciones();
        return;
      }
      this.loading.set(false);
      this.loadAsignaciones();
      this.loadCanciones();
      return;
    }
    this.loading.set(true);
    this.servicioService.getById(id).subscribe({
      next: (s) => {
        this.servicioResolved.set(s);
        this.loading.set(false);
        this.loadAsignaciones();
        this.loadCanciones();
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
    this.memberSearchQuery.set('');
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
    this.memberSearchQuery.set('');
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

  setTab(tab: 'miembros' | 'canciones'): void {
    this.internalTab.set(tab);
    this.tabChange.emit(tab);
    if (tab === 'canciones') this.loadCanciones();
  }

  loadCanciones(): void {
    const id = this.servicioId;
    if (id == null) return;
    this.loadingCanciones.set(true);
    this.servicioCancionService.getByServicio(id).subscribe({
      next: (list) => {
        this.canciones.set(list);
        this.loadingCanciones.set(false);
      },
      error: () => this.loadingCanciones.set(false),
    });
  }

  patchFormCancion(partial: Partial<{
    searchQuery: string;
    newAutor: string;
    newEnlace: string;
    director1Id: number | null;
    director2Id: number | null;
  }>): void {
    this.formCancion.set({ ...this.formCancion(), ...partial });
  }

  onSearchInput(value: string): void {
    this.patchFormCancion({ searchQuery: value });
    this.selectedCancion.set(null);
    this.addingNewSong.set(false);
    this.catalogSearch$.next(value);
  }

  selectCancion(c: Cancion): void {
    this.selectedCancion.set(c);
    this.addingNewSong.set(false);
  }

  startAddingNewSong(): void {
    this.addingNewSong.set(true);
    this.selectedCancion.set(null);
  }

  resetFormCancion(): void {
    this.editingCancionId.set(null);
    this.selectedCancion.set(null);
    this.addingNewSong.set(false);
    this.cancionError.set(null);
    this.formCancion.set({
      searchQuery: '',
      newAutor: '',
      newEnlace: '',
      director1Id: null,
      director2Id: null,
    });
    this.catalogResults.set([]);
  }

  editCancion(c: ServicioCancion): void {
    this.editingCancionId.set(c.id);
    this.formCancion.set({
      searchQuery: c.cancionNombre ?? '',
      newAutor: '',
      newEnlace: '',
      director1Id: c.director1Id,
      director2Id: c.director2Id,
    });
    this.selectedCancion.set(null);
    this.addingNewSong.set(false);
  }

  canSaveCancion(): boolean {
    const editId = this.editingCancionId();
    if (editId != null) return true;
    const sel = this.selectedCancion();
    const form = this.formCancion();
    if (sel) return true;
    if (this.addingNewSong() && form.searchQuery.trim()) return true;
    return false;
  }

  private toDirectorIds(form: { director1Id: number | null; director2Id: number | null }): { director1Id: number | null; director2Id: number | null } {
    const n = (v: number | null) => (v != null ? Number(v) : null);
    return { director1Id: n(form.director1Id), director2Id: n(form.director2Id) };
  }

  saveCancion(): void {
    const servicioId = this.servicioId;
    if (servicioId == null) return;
    this.cancionError.set(null);
    const form = this.formCancion();
    const editId = this.editingCancionId();
    const directors = this.toDirectorIds(form);

    if (editId != null) {
      this.savingCancion.set(true);
      this.servicioCancionService.update(servicioId, editId, directors).subscribe({
        next: () => {
          this.resetFormCancion();
          this.loadCanciones();
          this.savingCancion.set(false);
          this.asignacionesChanged.emit();
        },
        error: () => this.savingCancion.set(false),
      });
      return;
    }

    const sel = this.selectedCancion();
    if (sel) {
      this.savingCancion.set(true);
      this.servicioCancionService.create(servicioId, {
        cancionId: sel.id,
        director1Id: directors.director1Id,
        director2Id: directors.director2Id,
      }).subscribe({
        next: (creada) => {
          this.canciones.update(list => [...list, creada]);
          this.resetFormCancion();
          this.savingCancion.set(false);
          this.asignacionesChanged.emit();
        },
        error: (err) => {
          this.savingCancion.set(false);
          this.cancionError.set(this.mensajeErrorCancion(err, 'agregar al servicio'));
        },
      });
      return;
    }

    if (this.addingNewSong() && form.searchQuery.trim()) {
      this.savingCancion.set(true);
      this.cancionService.create({
        nombre: form.searchQuery.trim(),
        autor: form.newAutor.trim() || null,
        enlace: form.newEnlace.trim() || null,
      }).subscribe({
        next: created => {
          this.servicioCancionService.create(servicioId, {
            cancionId: created.id,
            director1Id: directors.director1Id,
            director2Id: directors.director2Id,
          }).subscribe({
            next: (creada) => {
              this.canciones.update(list => [...list, creada]);
              this.resetFormCancion();
              this.savingCancion.set(false);
              this.asignacionesChanged.emit();
            },
            error: (err) => {
              this.savingCancion.set(false);
              this.cancionError.set(this.mensajeErrorCancion(err, 'agregar al servicio'));
            },
          });
        },
        error: (err) => {
          this.savingCancion.set(false);
          this.cancionError.set(this.mensajeErrorCancion(err, 'crear en el catálogo'));
        },
      });
    }
  }

  /** Mensaje de error según la respuesta del servidor (sin asumir que el backend está caído). */
  private mensajeErrorCancion(err: { status?: number; error?: { message?: string } }, accion: string): string {
    const status = err?.status;
    const msg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null);
    if (status === 404) return `No se encontró el servicio o la canción.`;
    if (status === 400) return msg || `Datos incorrectos (${accion}).`;
    if (status === 500) return `Error del servidor al ${accion}. Revisa que la tabla servicio_cancion exista en la base de datos.`;
    if (status === 0) return `No se pudo conectar. Comprueba que el backend esté en marcha (puerto 8081).`;
    return msg || `No se pudo ${accion}. Código: ${status ?? 'desconocido'}.`;
  }

  deleteCancion(c: ServicioCancion): void {
    const id = this.servicioId;
    if (id == null) return;
    this.savingCancion.set(true);
    this.servicioCancionService.delete(id, c.id).subscribe({
      next: () => {
        this.loadCanciones();
        if (this.editingCancionId() === c.id) this.resetFormCancion();
        this.savingCancion.set(false);
        this.asignacionesChanged.emit();
      },
      error: () => this.savingCancion.set(false),
    });
  }

  /** Texto para mostrar quién dirige (director 1 y/o 2). */
  directoresDisplay(c: ServicioCancion): string {
    const a = c.director1Nombre?.trim();
    const b = c.director2Nombre?.trim();
    if (a && b) return `${a} y ${b}`;
    if (a) return a;
    if (b) return b;
    return '—';
  }
}
