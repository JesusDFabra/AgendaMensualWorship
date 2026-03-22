package com.elCamino.Worship.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elCamino.Worship.model.PaletaColores;
import com.elCamino.Worship.model.Service;
import com.elCamino.Worship.repository.PaletaColoresRepository;
import com.elCamino.Worship.repository.ServiceRepository;

@RestController
@RequestMapping("/api/servicio")
@CrossOrigin(origins = "*") // Permite que el frontend acceda
public class ServiceController {

    private final ServiceRepository repository;
    private final PaletaColoresRepository paletaColoresRepository;

    public ServiceController(ServiceRepository repository, PaletaColoresRepository paletaColoresRepository) {
        this.repository = repository;
        this.paletaColoresRepository = paletaColoresRepository;
    }

    @GetMapping
    public List<Service> getAllServices() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping 
    public ResponseEntity<List<Service>> createMultipleServices(@RequestBody List<Service> services) {
        // Verifica si ya existe la fecha 
        List<LocalDate> fechasExistentes = repository.findAll()
                .stream()
                .map(Service::getFecha)
                .toList();
        //saca solo los nuevos
        List<Service> nuevos = services.stream()
                .filter(s -> !fechasExistentes.contains(s.getFecha()))
                .peek(s -> s.setCreadoEn(LocalDate.now()))
                .toList();
        //los guarda
        List<Service> guardados = repository.saveAll(nuevos);
        return ResponseEntity.ok(guardados);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @RequestBody Service updatedService) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setFecha(updatedService.getFecha());
                    existing.setNombre(updatedService.getNombre());
                    Service saved = repository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Asigna o quita la paleta de colores del servicio. Body: { "paletaId": 1 } o { "paletaId": null }.
     */
    @PutMapping("/{id}/paleta")
    public ResponseEntity<Service> setPaletaColores(@PathVariable Long id, @RequestBody PaletaServicioBody body) {
        Optional<Service> opt = repository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Service existing = opt.get();
        if (body == null || body.paletaId == null) {
            existing.setPaletaColores(null);
        } else {
            Optional<PaletaColores> paletaOpt = paletaColoresRepository.findById(body.paletaId);
            if (paletaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            existing.setPaletaColores(paletaOpt.get());
        }
        return ResponseEntity.ok(repository.save(existing));
    }

    public static final class PaletaServicioBody {
        public Long paletaId;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
