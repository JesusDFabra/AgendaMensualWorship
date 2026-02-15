import { NgClass } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CancionService, Cancion } from '../../core/services/cancion.service';
import { AdminAuthService } from '../../core/services/admin-auth.service';

@Component({
  selector: 'app-cancion-list',
  standalone: true,
  imports: [FormsModule, RouterLink, NgClass],
  templateUrl: './cancion-list.component.html',
  styleUrl: './cancion-list.component.scss',
})
export class CancionListComponent implements OnInit {
  canciones = signal<Cancion[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  /** Id de la canción en edición, o null si estamos creando una nueva, o -1 si el formulario está cerrado. */
  editingId = signal<number | null>(-1);
  saving = signal(false);
  formNombre = signal('');
  formAutor = signal('');
  formEnlace = signal('');
  /** Id de la canción a eliminar (para confirmación). */
  deletingId = signal<number | null>(null);

  constructor(
    private cancionService: CancionService,
    public adminAuth: AdminAuthService,
  ) {}

  filteredCanciones = computed(() => {
    const list = this.canciones();
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      c =>
        (c.nombre ?? '').toLowerCase().includes(q) ||
        (c.autor ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.cancionService.list().subscribe({
      next: (list) => {
        this.canciones.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el listado de canciones.');
        this.loading.set(false);
      },
    });
  }

  openAdd(): void {
    this.editingId.set(null);
    this.formNombre.set('');
    this.formAutor.set('');
    this.formEnlace.set('');
  }

  openEdit(c: Cancion): void {
    this.editingId.set(c.id);
    this.formNombre.set(c.nombre ?? '');
    this.formAutor.set(c.autor ?? '');
    this.formEnlace.set(c.enlace ?? '');
  }

  closeForm(): void {
    this.editingId.set(-1);
  }

  save(): void {
    const nombre = this.formNombre().trim();
    if (!nombre) return;
    this.saving.set(true);
    this.error.set(null);
    const body = {
      nombre,
      autor: this.formAutor().trim() || null,
      enlace: this.formEnlace().trim() || null,
    };
    const id = this.editingId();
    const req =
      id != null
        ? this.cancionService.update(id, body)
        : this.cancionService.create(body);
    req.subscribe({
      next: () => {
        this.load();
        this.closeForm();
        this.saving.set(false);
      },
      error: () => {
        this.error.set('No se pudo guardar la canción.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(c: Cancion): void {
    this.deletingId.set(c.id);
  }

  cancelDelete(): void {
    this.deletingId.set(null);
  }

  doDelete(): void {
    const id = this.deletingId();
    if (id == null) return;
    this.saving.set(true);
    this.error.set(null);
    this.cancionService.delete(id).subscribe({
      next: () => {
        this.load();
        this.deletingId.set(null);
        this.saving.set(false);
      },
      error: () => {
        this.error.set('No se pudo eliminar la canción.');
        this.saving.set(false);
      },
    });
  }

  isEditing(id: number | null): boolean {
    return this.editingId() === id;
  }

  isAdding(): boolean {
    return this.editingId() === null;
  }

  showForm(): boolean {
    const e = this.editingId();
    return e !== -1;
  }
}
