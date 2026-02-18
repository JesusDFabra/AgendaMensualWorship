import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MemberService, Member } from '../../../core/services/member.service';
import { AdminAuthService } from '../../../core/services/admin-auth.service';
import { MemberFormComponent } from '../member-form/member-form.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MemberFormComponent],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss',
})
export class MemberListComponent implements OnInit {
  readonly pageSize = 10;
  currentPage = 1;
  members: Member[] = [];
  searchTerm = '';
  /** true = mostrar todos; false = solo activos (toggle OFF = solo activos, ON = todos). */
  showAll = false;
  showAddModal = false;
  loading = true;
  error: string | null = null;
  /** Criterio de ordenación (por defecto apellidos). */
  sortBy: 'apellido' | 'nombreCompleto' | 'alias' | 'rol' = 'apellido';

  constructor(
    private memberService: MemberService,
    public adminAuth: AdminAuthService,
  ) {}

  get filteredMembers(): Member[] {
    let list = this.members;
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((m) => {
        const nombre = (m.nombre ?? '').toLowerCase();
        const apellido = (m.apellido ?? '').toLowerCase();
        const alias = (m.alias ?? '').toLowerCase();
        const rol = (m.rol?.nombre ?? '').toLowerCase();
        return nombre.includes(term) || apellido.includes(term) || alias.includes(term) || rol.includes(term);
      });
    }
    if (!this.showAll) {
      list = list.filter((m) => m.activo === true);
    }
    list = [...list].sort((a, b) => this.compareMembers(a, b));
    return list;
  }

  private compareMembers(a: Member, b: Member): number {
    const empty = '\uFFFF'; // para que null/undefined queden al final
    switch (this.sortBy) {
      case 'apellido': {
        const apA = (a.apellido ?? '').trim().toLowerCase();
        const apB = (b.apellido ?? '').trim().toLowerCase();
        if (apA !== apB) return apA.localeCompare(apB);
        return (a.nombre ?? '').trim().toLowerCase().localeCompare((b.nombre ?? '').trim().toLowerCase());
      }
      case 'nombreCompleto': {
        const fullA = `${(a.nombre ?? '').trim()} ${(a.apellido ?? '').trim()}`.trim().toLowerCase();
        const fullB = `${(b.nombre ?? '').trim()} ${(b.apellido ?? '').trim()}`.trim().toLowerCase();
        return fullA.localeCompare(fullB);
      }
      case 'alias':
        return (a.alias ?? empty).trim().toLowerCase().localeCompare((b.alias ?? empty).trim().toLowerCase());
      case 'rol':
        return (a.rol?.nombre ?? empty).trim().toLowerCase().localeCompare((b.rol?.nombre ?? empty).trim().toLowerCase());
      default:
        return 0;
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredMembers.length / this.pageSize));
  }

  get paginatedMembers(): Member[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMembers.slice(start, start + this.pageSize);
  }

goToPage(page: number): void {
  this.currentPage = Math.max(1, Math.min(page, this.totalPages));
}

onSearchInput(): void {
  this.currentPage = 1;
}

toggleActiveFilter(): void {
  this.showAll = !this.showAll;
  this.currentPage = 1;
}

onSortChange(): void {
  this.currentPage = 1;
}

openAddModal(): void {
  this.showAddModal = true;
}

closeAddModal(): void {
  this.showAddModal = false;
}

onMemberSaved(): void {
  this.showAddModal = false;
  this.memberService.getAll().subscribe({
    next: (data: Member[]) => {
      this.members = data;
    },
  });
}

readonly Math = Math;

  ngOnInit(): void {
    this.memberService.getAll().subscribe({
      next: (data: Member[]) => {
        this.members = data;
        this.loading = false;
      },
      error: (err: unknown) => {
        this.error = err instanceof Error ? err.message : 'No se pudo cargar el listado. Comprueba tu conexión o inténtalo más tarde.';
        this.loading = false;
      },
    });
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('es');
  }
}
