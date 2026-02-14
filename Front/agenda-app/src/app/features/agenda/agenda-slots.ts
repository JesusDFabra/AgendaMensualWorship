/** IDs de rol en BD: 1 Bajo, 2 Bateria, 3 Guitarra, 4 Piano, 5 Voz */
export const ROL_IDS = {
  bajo: 1,
  bateria: 2,
  guitarra: 3,
  piano: 4,
  voz: 5,
} as const;

/** Color único para todas las voces (Voz 1-5). */
const VOZ_COLOR = { border: 'border-l-rose-500 dark:border-l-rose-400', bg: 'bg-rose-50/60 dark:bg-rose-900/20' };

/** Clases Tailwind por rol (borde izquierdo + fondo suave) para distinguir visualmente. */
export const SLOT_COLORS = [
  VOZ_COLOR,  // Voz 1
  VOZ_COLOR,  // Voz 2
  VOZ_COLOR,  // Voz 3
  VOZ_COLOR,  // Voz 4
  VOZ_COLOR,  // Voz 5
  { border: 'border-l-yellow-500 dark:border-l-yellow-400', bg: 'bg-yellow-50/60 dark:bg-yellow-900/20' }, // Piano
  { border: 'border-l-orange-500 dark:border-l-orange-400', bg: 'bg-orange-50/60 dark:bg-orange-900/20' }, // Guitarra
  { border: 'border-l-teal-500 dark:border-l-teal-400', bg: 'bg-teal-50/60 dark:bg-teal-900/20' },   // Bajo
  { border: 'border-l-blue-500 dark:border-l-blue-400', bg: 'bg-blue-50/60 dark:bg-blue-900/20' },   // Batería
] as const;

/** Slots a mostrar en la agenda: etiqueta y rolId. Orden: Voz 1-5, Piano, Guitarra, Bajo, Batería. */
export const AGENDA_SLOTS: { label: string; rolId: number }[] = [
  { label: 'Voz 1', rolId: ROL_IDS.voz },
  { label: 'Voz 2', rolId: ROL_IDS.voz },
  { label: 'Voz 3', rolId: ROL_IDS.voz },
  { label: 'Voz 4', rolId: ROL_IDS.voz },
  { label: 'Voz 5', rolId: ROL_IDS.voz },
  { label: 'Piano', rolId: ROL_IDS.piano },
  { label: 'Guitarra', rolId: ROL_IDS.guitarra },
  { label: 'Bajo', rolId: ROL_IDS.bajo },
  { label: 'Batería', rolId: ROL_IDS.bateria },
];
