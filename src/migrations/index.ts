import * as migration_20261111_030053_inicial from './20261111_030053_inicial';
import * as migration_20261111_032630_carrusel from './20261111_032630_carrusel';
import * as migration_20261111_040159_orden_arrastrando from './20261111_040159_orden_arrastrando';

export const migrations = [
  {
    up: migration_20261111_030053_inicial.up,
    down: migration_20261111_030053_inicial.down,
    name: '20261111_030053_inicial',
  },
  {
    up: migration_20261111_032630_carrusel.up,
    down: migration_20261111_032630_carrusel.down,
    name: '20261111_032630_carrusel',
  },
  {
    up: migration_20261111_040159_orden_arrastrando.up,
    down: migration_20261111_040159_orden_arrastrando.down,
    name: '20261111_040159_orden_arrastrando'
  },
];
