import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'agenda_admin';
const ADMIN_PASSWORD = 'admin';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  readonly isAdmin = signal<boolean>(this.loadFromStorage());

  constructor() {
    effect(() => {
      const admin = this.isAdmin();
      if (typeof sessionStorage !== 'undefined') {
        if (admin) {
          sessionStorage.setItem(STORAGE_KEY, '1');
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    });
  }

  private loadFromStorage(): boolean {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  loginAdmin(password: string): boolean {
    if (password.trim() === ADMIN_PASSWORD) {
      this.isAdmin.set(true);
      return true;
    }
    return false;
  }

  logoutAdmin(): void {
    this.isAdmin.set(false);
  }
}
