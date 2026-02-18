import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from './core/services/theme.service';
import { AdminAuthService } from './core/services/admin-auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  showAdminModal = signal(false);
  adminPassword = signal('');
  adminError = signal(false);
  /** Menú móvil abierto (hamburguesa). */
  mobileMenuOpen = signal(false);

  constructor(
    public theme: ThemeService,
    public adminAuth: AdminAuthService,
  ) {}

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
}
