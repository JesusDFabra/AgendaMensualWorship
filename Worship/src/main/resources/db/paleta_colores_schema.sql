-- Referencia: tabla de paletas (ajusta nombres si tu BD ya existe con otra convención).
-- La columna en servicio debe llamarse colors_id (FK nullable a paleta_colores.id).

CREATE TABLE IF NOT EXISTS paleta_colores (
    id BIGSERIAL PRIMARY KEY,
    color1 TEXT NOT NULL,
    color2 TEXT NOT NULL,
    color3 TEXT NOT NULL,
    color4 TEXT NOT NULL
);

-- En servicio (si aún no existe):
-- ALTER TABLE servicio ADD COLUMN colors_id BIGINT REFERENCES paleta_colores (id);
-- (nullable para permitir servicio sin paleta)
