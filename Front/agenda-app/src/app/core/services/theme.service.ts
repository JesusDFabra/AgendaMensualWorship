import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'agenda-worship-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.loadInitial());

  constructor() {
    this.apply(this.isDark()); // Aplicar de inmediato al cargar (evita parpadeo)
    effect(() => {
      const dark = this.isDark();
      this.apply(dark);
    });
  }

  private loadInitial(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return false;
    return stored === 'true';
  }

  private apply(dark: boolean): void {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, String(dark));
  }

  toggle(): void {
    this.isDark.update((v) => !v);
  }
}
