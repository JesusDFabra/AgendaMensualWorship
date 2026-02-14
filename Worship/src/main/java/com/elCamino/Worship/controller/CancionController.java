package com.elCamino.Worship.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.elCamino.Worship.model.Cancion;
import com.elCamino.Worship.repository.CancionRepository;

@RestController
@RequestMapping("/api/cancion")
@CrossOrigin(origins = "*")
public class CancionController {

    private final CancionRepository repository;

    public CancionController(CancionRepository repository) {
        this.repository = repository;
    }

    /** Obtiene una canción por id. */
    @GetMapping("/{id}")
    public ResponseEntity<Cancion> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Lista todas las canciones (para búsqueda/selector). */
    @GetMapping
    public ResponseEntity<List<Cancion>> list(
            @RequestParam(required = false) String q) {
        List<Cancion> list;
        if (q != null && !q.trim().isEmpty()) {
            list = repository.findByNombreContainingIgnoreCaseOrderByNombreAsc(q.trim());
        } else {
            list = repository.findAllByOrderByNombreAsc();
        }
        return ResponseEntity.ok(list);
    }

    /** Crea una canción en el catálogo; si ya existe una con el mismo nombre y autor, devuelve la existente. */
    @PostMapping
    public ResponseEntity<Cancion> create(@RequestBody CancionDto dto) {
        String nombre = dto.getNombre() != null ? dto.getNombre().trim() : "";
        if (nombre.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String autor = dto.getAutor() != null ? dto.getAutor().trim() : null;
        if (autor != null && autor.isEmpty()) autor = null;
        List<Cancion> existentes = repository.findByNombreTrimmedIgnoreCase(nombre);
        for (Cancion c : existentes) {
            String a = c.getAutor();
            if (a != null && a.isEmpty()) a = null;
            boolean autorMatch = (autor == null && a == null) || (autor != null && autor.equalsIgnoreCase(a != null ? a.trim() : ""));
            if (autorMatch) {
                return ResponseEntity.ok(c);
            }
        }
        Cancion entity = new Cancion();
        entity.setNombre(nombre);
        entity.setAutor(autor);
        entity.setEnlace(dto.getEnlace() != null ? dto.getEnlace().trim() : null);
        entity = repository.save(entity);
        return ResponseEntity.ok(entity);
    }

    /** Actualiza una canción del catálogo. */
    @PutMapping("/{id}")
    public ResponseEntity<Cancion> update(@PathVariable Long id, @RequestBody CancionDto dto) {
        Cancion entity = repository.findById(id).orElse(null);
        if (entity == null) {
            return ResponseEntity.notFound().build();
        }
        String nombre = dto.getNombre() != null ? dto.getNombre().trim() : "";
        if (nombre.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        entity.setNombre(nombre);
        entity.setAutor(dto.getAutor() != null && !dto.getAutor().trim().isEmpty() ? dto.getAutor().trim() : null);
        entity.setEnlace(dto.getEnlace() != null && !dto.getEnlace().trim().isEmpty() ? dto.getEnlace().trim() : null);
        entity = repository.save(entity);
        return ResponseEntity.ok(entity);
    }

    /** Elimina una canción del catálogo. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public static final class CancionDto {
        private String nombre;
        private String autor;
        private String enlace;

        public CancionDto() {}

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getAutor() { return autor; }
        public void setAutor(String autor) { this.autor = autor; }
        public String getEnlace() { return enlace; }
        public void setEnlace(String enlace) { this.enlace = enlace; }
    }
}
