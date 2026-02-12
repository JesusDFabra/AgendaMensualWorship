package com.elCamino.Worship.controller;

import java.time.LocalDate;
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

import com.elCamino.Worship.model.Availability;
import com.elCamino.Worship.repository.AvailabilityRepository;

@RestController
@RequestMapping("/api/novedades")
@CrossOrigin(origins = "*") // Permite el acceso desde Angular u otros frontends
public class AvailabilityController {

    private final AvailabilityRepository repository;

    // Constructor manual
    public AvailabilityController(AvailabilityRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Availability> getAvailabilities(@RequestParam(required = false) Long miembroId) {
        if (miembroId != null) {
            return repository.findByMiembro_Id(miembroId);
        }
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<List<Availability>> createMultipleAvailabilities(@RequestBody List<Availability> availabilities) {
        for (Availability availability : availabilities) {
            availability.setFechaRegistro(LocalDate.now());
        }
        List<Availability> saved = repository.saveAll(availabilities);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Availability> updateAvailability(@PathVariable Long id, @RequestBody Availability updatedAvailability) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setMiembro(updatedAvailability.getMiembro());
                    existing.setServicio(updatedAvailability.getServicio());
                    existing.setObservacion(updatedAvailability.getObservacion());
                    Availability saved = repository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
