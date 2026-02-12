# Guía rápida: Tailwind CSS en Angular

Este proyecto usa **Tailwind CSS v4**. Las clases se escriben en el HTML y no hace falta (casi nunca) escribir CSS a mano.

## Cómo funciona

- **Utilidades:** cada clase hace una cosa. Ej: `text-center`, `font-bold`, `mt-4`.
- **Combinar clases:** varias clases en el mismo elemento. Ej: `class="text-lg font-semibold text-stone-800"`.

## Clases que ya estás viendo en el proyecto

| Clase | Qué hace |
|-------|----------|
| `min-h-screen` | Altura mínima = pantalla completa |
| `bg-stone-50` | Fondo gris muy claro (paleta stone) |
| `max-w-5xl` | Ancho máximo del contenedor |
| `mx-auto` | Centrar horizontalmente |
| `px-4 py-6` | Padding: horizontal 1rem, vertical 1.5rem |
| `rounded-2xl` | Bordes muy redondeados |
| `border border-stone-200` | Borde gris claro |
| `shadow-sm` / `hover:shadow-md` | Sombra suave; al pasar el ratón, sombra media |
| `hover:border-amber-200` | Al hover, borde color ámbar |
| `transition-all duration-200` | Transición suave de 200ms |
| `text-4xl` | Tamaño de texto grande |
| `font-bold` | Negrita |
| `text-stone-800` | Color de texto oscuro |
| `grid grid-cols-1 sm:grid-cols-3` | Grid: 1 columna en móvil, 3 en pantallas `sm` y mayores |
| `gap-4` | Espacio entre hijos (1rem) |
| `flex flex-col items-center` | Flex en columna, contenido centrado |

## Paletas de color (ejemplos)

- **stone:** grises neutros → `stone-50` (muy claro) a `stone-900` (muy oscuro).
- **amber:** para acentos → `amber-200`, `amber-600`, etc.

## Responsive

- Sin prefijo = móvil.
- `sm:` = 640px y más.
- `md:` = 768px y más.
- `lg:` = 1024px y más.

Ejemplo: `text-base md:text-lg` → texto base en móvil, más grande en `md`.

## Documentación oficial

- [Tailwind CSS](https://tailwindcss.com/docs) — referencia de todas las clases.
- Busca por concepto (ej: "padding", "flexbox", "color") en la doc.

## Próximos pasos

1. Cambia colores: sustituye `stone` por `slate`, `gray` o `zinc` y prueba.
2. Añade una nueva página y usa `flex`, `grid`, `space-y-4`, `rounded-xl`.
3. Prueba `hover:` y `focus:` en botones y enlaces.
