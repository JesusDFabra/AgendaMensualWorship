import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { Brand } from '../../../environments/brand';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly brand: Brand = environment.brand;

  get appName(): string {
    return this.brand.appName;
  }

  get tagline(): string | undefined {
    return this.brand.tagline;
  }

  get heroLabel(): string {
    return this.brand.heroLabel ?? 'Equipo de alabanza';
  }

  get heroDescription(): string {
    return this.brand.heroDescription ?? 'Organiza servicios, gestiona miembros y comunica todo lo del equipo de alabanza en un solo lugar.';
  }
}
