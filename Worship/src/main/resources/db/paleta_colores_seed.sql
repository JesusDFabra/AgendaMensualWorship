-- Ejecutar en PostgreSQL si la tabla paleta_colores existe y está vacía (o ajustar IDs).
-- Paletas de ejemplo: 4 hex por fila (#RRGGBB).

INSERT INTO paleta_colores (id, color1, color2, color3, color4)
SELECT 1, '#1c1917', '#1e3a8a', '#0369a1', '#67e8f9'
WHERE NOT EXISTS (SELECT 1 FROM paleta_colores WHERE id = 1);

INSERT INTO paleta_colores (id, color1, color2, color3, color4)
SELECT 2, '#422006', '#9a3412', '#ea580c', '#fdba74'
WHERE NOT EXISTS (SELECT 1 FROM paleta_colores WHERE id = 2);

INSERT INTO paleta_colores (id, color1, color2, color3, color4)
SELECT 3, '#14532d', '#166534', '#22c55e', '#bbf7d0'
WHERE NOT EXISTS (SELECT 1 FROM paleta_colores WHERE id = 3);

INSERT INTO paleta_colores (id, color1, color2, color3, color4)
SELECT 4, '#3b0764', '#6b21a8', '#a855f7', '#e9d5ff'
WHERE NOT EXISTS (SELECT 1 FROM paleta_colores WHERE id = 4);

INSERT INTO paleta_colores (id, color1, color2, color3, color4)
SELECT 5, '#0f172a', '#334155', '#64748b', '#e2e8f0'
WHERE NOT EXISTS (SELECT 1 FROM paleta_colores WHERE id = 5);

INSERT INTO paleta_colores (id, color1, color2, color3, color4)
SELECT 6, '#7f1d1d', '#b91c1c', '#f87171', '#fecaca'
WHERE NOT EXISTS (SELECT 1 FROM paleta_colores WHERE id = 6);

INSERT INTO paleta_colores (id, color1, color2, color3, color4)
SELECT 7, '#0c4a6e', '#0369a1', '#38bdf8', '#e0f2fe'
WHERE NOT EXISTS (SELECT 1 FROM paleta_colores WHERE id = 7);

INSERT INTO paleta_colores (id, color1, color2, color3, color4)
SELECT 8, '#292524', '#78716c', '#d6d3d1', '#fafaf9'
WHERE NOT EXISTS (SELECT 1 FROM paleta_colores WHERE id = 8);
