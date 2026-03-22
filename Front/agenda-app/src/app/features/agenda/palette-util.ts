import type { PaletaColores } from '../../core/services/servicio.service';

/** Cuatro colores para pintar los cuadros; null = transparente (solo borde). */
export function paletteToHexArray(p: PaletaColores | null | undefined): (string | null)[] {
  if (!p) {
    return [null, null, null, null];
  }
  return [p.color1, p.color2, p.color3, p.color4].map((c) =>
    c?.trim() ? c.trim() : null,
  );
}
