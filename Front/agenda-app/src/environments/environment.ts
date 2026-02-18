import type { Brand } from './brand';

export const environment = {
  apiUrl: 'https://agenda-worship-api.onrender.com',
  // apiUrl: 'http://localhost:8081', // Conexión por medio de mvn spring-boot:run
  brand: {
    appName: 'Agenda Worship',
    heroLabel: 'Equipo de alabanza',
    heroDescription: 'Organiza servicios, gestiona miembros y comunica todo lo del equipo de alabanza en un solo lugar.',
  } as Brand,
};
