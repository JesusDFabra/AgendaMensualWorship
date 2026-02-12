import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MemberService, Member } from '../../../core/services/member.service';
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
  showOnlyActive = false;
  showAddModal = false;
  loading = true;
  error: string | null = null;

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
    if (this.showOnlyActive) {
      list = list.filter((m) => m.activo === true);
    }
    return list;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredMembers.length / this.pageSize));
  }

  get paginatedMembers(): Member[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMembers.slice(start, start + this.pageSize);
  }

constructor(private memberService: MemberService) {}

goToPage(page: number): void {
  this.currentPage = Math.max(1, Math.min(page, this.totalPages));
}

onSearchInput(): void {
  this.currentPage = 1;
}

toggleActiveFilter(): void {
  this.showOnlyActive = !this.showOnlyActive;
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
        this.error = err instanceof Error ? err.message : 'No se pudo cargar el listado. ¿Está el backend en marcha (puerto 8081)?';
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
