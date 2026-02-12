/** IDs de rol en BD: 1 Bajo, 2 Bateria, 3 Guitarra, 4 Piano, 5 Voz */
export const ROL_IDS = {
  bajo: 1,
  bateria: 2,
  guitarra: 3,
  piano: 4,
  voz: 5,
} as const;

/** Slots a mostrar en la agenda: etiqueta y rolId. Orden: instrumentos y luego 5 voces. */
export const AGENDA_SLOTS: { label: string; rolId: number }[] = [
  { label: 'Batería', rolId: ROL_IDS.bateria },
  { label: 'Guitarra', rolId: ROL_IDS.guitarra },
  { label: 'Bajo', rolId: ROL_IDS.bajo },
  { label: 'Piano', rolId: ROL_IDS.piano },
  { label: 'Voz 1', rolId: ROL_IDS.voz },
  { label: 'Voz 2', rolId: ROL_IDS.voz },
  { label: 'Voz 3', rolId: ROL_IDS.voz },
  { label: 'Voz 4', rolId: ROL_IDS.voz },
  { label: 'Voz 5', rolId: ROL_IDS.voz },
];
