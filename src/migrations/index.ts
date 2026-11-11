import * as migration_20261111_030053_inicial from './20261111_030053_inicial';
import * as migration_20261111_032630_carrusel from './20261111_032630_carrusel';

export const migrations = [
  {
    up: migration_20261111_030053_inicial.up,
    down: migration_20261111_030053_inicial.down,
    name: '20261111_030053_inicial',
  },
  {
    up: migration_20261111_032630_carrusel.up,
    down: migration_20261111_032630_carrusel.down,
    name: '20261111_032630_carrusel'
  },
];
