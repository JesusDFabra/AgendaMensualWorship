-- Tabla servicio_cancion (vínculo servicio–canción con directores).
-- El backend usa esta tabla. Si no existe, ejecuta este script.

CREATE TABLE IF NOT EXISTS servicio_cancion (
  id BIGSERIAL PRIMARY KEY,
  servicio_id BIGINT NOT NULL REFERENCES servicio(id) ON DELETE CASCADE,
  cancion_id BIGINT NOT NULL REFERENCES cancion(id) ON DELETE CASCADE,
  director_1 BIGINT REFERENCES miembro(id) ON DELETE SET NULL,
  director_2 BIGINT REFERENCES miembro(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_servicio_cancion_servicio_id ON servicio_cancion(servicio_id);
