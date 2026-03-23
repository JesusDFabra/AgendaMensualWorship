package com.elCamino.Worship.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.elCamino.Worship.model.PaletaColores;
import com.elCamino.Worship.repository.PaletaColoresRepository;
import com.elCamino.Worship.repository.ServiceRepository;

@RestController
@RequestMapping("/api/paleta-colores")
@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }
)
public class PaletaColoresController {

    private final PaletaColoresRepository repository;
    private final ServiceRepository serviceRepository;

    public PaletaColoresController(PaletaColoresRepository repository, ServiceRepository serviceRepository) {
        this.repository = repository;
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public ResponseEntity<List<PaletaColores>> listar() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody PaletaBody body) {
        String error = validateBody(body);
        if (error != null) {
            return ResponseEntity.badRequest().body(error);
        }
        PaletaColores p = new PaletaColores();
        p.setColor1(body.color1.trim());
        p.setColor2(body.color2.trim());
        p.setColor3(body.color3.trim());
        p.setColor4(body.color4.trim());
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody PaletaBody body) {
        String error = validateBody(body);
        if (error != null) {
            return ResponseEntity.badRequest().body(error);
        }
        Optional<PaletaColores> opt = repository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PaletaColores p = opt.get();
        p.setColor1(body.color1.trim());
        p.setColor2(body.color2.trim());
        p.setColor3(body.color3.trim());
        p.setColor4(body.color4.trim());
        return ResponseEntity.ok(repository.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (serviceRepository.existsByPaletaColores_Id(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No se puede eliminar la paleta porque está asignada a uno o más servicios.");
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private static String validateBody(PaletaBody body) {
        if (body == null) return "Falta body";
        if (!isHex(body.color1) || !isHex(body.color2) || !isHex(body.color3) || !isHex(body.color4)) {
            return "Los 4 colores deben tener formato HEX (#RRGGBB).";
        }
        return null;
    }

    private static boolean isHex(String s) {
        return s != null && s.trim().matches("^#[0-9A-Fa-f]{6}$");
    }

    public static final class PaletaBody {
        public String color1;
        public String color2;
        public String color3;
        public String color4;
    }
}
