import { Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ThemeService } from './core/services/theme.service';
import { AdminAuthService } from './core/services/admin-auth.service';
import { BrandService } from './core/services/brand.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  showAdminModal = signal(false);
  adminPassword = signal('');
  adminError = signal(false);
  /** Menú móvil abierto (hamburguesa). */
  mobileMenuOpen = signal(false);
  /** Mostrar botón "ir arriba" cuando el usuario ha hecho scroll hacia abajo. */
  showBackToTop = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showBackToTop.set(typeof window !== 'undefined' && window.scrollY > 400);
  }

  constructor(
    public theme: ThemeService,
    public adminAuth: AdminAuthService,
    public brand: BrandService,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle(this.brand.appName);
  }

  openAdminModal(): void {
    this.adminPassword.set('');
    this.adminError.set(false);
    this.showAdminModal.set(true);
  }

  closeAdminModal(): void {
    this.showAdminModal.set(false);
    this.adminPassword.set('');
    this.adminError.set(false);
  }

  submitAdminLogin(): void {
    const ok = this.adminAuth.loginAdmin(this.adminPassword());
    if (ok) {
      this.closeAdminModal();
    } else {
      this.adminError.set(true);
    }
  }

  logoutAdmin(): void {
    this.adminAuth.logoutAdmin();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
