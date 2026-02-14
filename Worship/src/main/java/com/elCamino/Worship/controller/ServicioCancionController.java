package com.elCamino.Worship.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import com.elCamino.Worship.model.Cancion;
import com.elCamino.Worship.model.Member;
import com.elCamino.Worship.model.ServicioCancion;
import com.elCamino.Worship.model.Service;
import com.elCamino.Worship.repository.CancionRepository;
import com.elCamino.Worship.repository.MemberRepository;
import com.elCamino.Worship.repository.ServicioCancionRepository;
import com.elCamino.Worship.repository.ServiceRepository;

@RestController
@RequestMapping("/api/servicio")
@CrossOrigin(origins = "*")
public class ServicioCancionController {

    private final ServicioCancionRepository repository;
    private final ServiceRepository serviceRepository;
    private final CancionRepository cancionRepository;
    private final MemberRepository memberRepository;

    public ServicioCancionController(ServicioCancionRepository repository, ServiceRepository serviceRepository,
            CancionRepository cancionRepository, MemberRepository memberRepository) {
        this.repository = repository;
        this.serviceRepository = serviceRepository;
        this.cancionRepository = cancionRepository;
        this.memberRepository = memberRepository;
    }

    @GetMapping("/{servicioId}/canciones")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ServicioCancionDto>> getByServicio(@PathVariable Long servicioId) {
        if (!serviceRepository.existsById(servicioId)) {
            return ResponseEntity.notFound().build();
        }
        List<ServicioCancion> list = repository.findByServicio_IdOrderById(servicioId);
        List<ServicioCancionDto> dtos = list.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{servicioId}/canciones")
    public ResponseEntity<ServicioCancionDto> create(
            @PathVariable Long servicioId,
            @RequestBody ServicioCancionDto dto) {
        Service servicio = serviceRepository.findById(servicioId).orElse(null);
        if (servicio == null) {
            return ResponseEntity.notFound().build();
        }
        Cancion cancion = dto.getCancionId() != null ? cancionRepository.findById(dto.getCancionId()).orElse(null) : null;
        if (cancion == null) {
            return ResponseEntity.badRequest().build();
        }
        ServicioCancion entity = new ServicioCancion();
        entity.setServicio(servicio);
        entity.setCancion(cancion);
        entity.setDirector1(dto.getDirector1Id() != null ? memberRepository.findById(dto.getDirector1Id()).orElse(null) : null);
        entity.setDirector2(dto.getDirector2Id() != null ? memberRepository.findById(dto.getDirector2Id()).orElse(null) : null);
        entity = repository.save(entity);
        entity = repository.findByIdWithAssociations(entity.getId()).orElse(entity);
        return ResponseEntity.ok(toDto(entity));
    }

    @PutMapping("/{servicioId}/canciones/{id}")
    public ResponseEntity<ServicioCancionDto> update(
            @PathVariable Long servicioId,
            @PathVariable Long id,
            @RequestBody ServicioCancionDto dto) {
        ServicioCancion existing = repository.findById(id).orElse(null);
        if (existing == null || !existing.getServicio().getId().equals(servicioId)) {
            return ResponseEntity.notFound().build();
        }
        existing.setDirector1(dto.getDirector1Id() != null ? memberRepository.findById(dto.getDirector1Id()).orElse(null) : null);
        existing.setDirector2(dto.getDirector2Id() != null ? memberRepository.findById(dto.getDirector2Id()).orElse(null) : null);
        existing = repository.save(existing);
        existing = repository.findByIdWithAssociations(existing.getId()).orElse(existing);
        return ResponseEntity.ok(toDto(existing));
    }

    @DeleteMapping("/{servicioId}/canciones/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long servicioId, @PathVariable Long id) {
        ServicioCancion existing = repository.findById(id).orElse(null);
        if (existing == null || !existing.getServicio().getId().equals(servicioId)) {
            return ResponseEntity.notFound().build();
        }
        repository.delete(existing);
        return ResponseEntity.noContent().build();
    }

    private static String memberDisplay(Member m) {
        if (m == null) return null;
        String nom = (m.getNombre() != null ? m.getNombre() : "") + " " + (m.getApellido() != null ? m.getApellido() : "").trim();
        if (m.getAlias() != null && !m.getAlias().isEmpty()) return m.getAlias();
        return nom.isEmpty() ? null : nom.trim();
    }

    private ServicioCancionDto toDto(ServicioCancion sc) {
        Cancion c = sc.getCancion();
        return new ServicioCancionDto(
                sc.getId(),
                sc.getServicio().getId(),
                c != null ? c.getId() : null,
                c != null ? c.getNombre() : null,
                c != null ? c.getAutor() : null,
                c != null ? c.getEnlace() : null,
                sc.getDirector1() != null ? sc.getDirector1().getId() : null,
                memberDisplay(sc.getDirector1()),
                sc.getDirector2() != null ? sc.getDirector2().getId() : null,
                memberDisplay(sc.getDirector2()));
    }

    public static final class ServicioCancionDto {
        private Long id;
        private Long servicioId;
        private Long cancionId;
        private String cancionNombre;
        private String cancionAutor;
        private String cancionEnlace;
        private Long director1Id;
        private String director1Nombre;
        private Long director2Id;
        private String director2Nombre;

        public ServicioCancionDto() {}

        public ServicioCancionDto(Long id, Long servicioId, Long cancionId, String cancionNombre, String cancionAutor, String cancionEnlace,
                Long director1Id, String director1Nombre, Long director2Id, String director2Nombre) {
            this.id = id;
            this.servicioId = servicioId;
            this.cancionId = cancionId;
            this.cancionNombre = cancionNombre;
            this.cancionAutor = cancionAutor;
            this.cancionEnlace = cancionEnlace;
            this.director1Id = director1Id;
            this.director1Nombre = director1Nombre;
            this.director2Id = director2Id;
            this.director2Nombre = director2Nombre;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getServicioId() { return servicioId; }
        public void setServicioId(Long servicioId) { this.servicioId = servicioId; }
        public Long getCancionId() { return cancionId; }
        public void setCancionId(Long cancionId) { this.cancionId = cancionId; }
        public String getCancionNombre() { return cancionNombre; }
        public void setCancionNombre(String cancionNombre) { this.cancionNombre = cancionNombre; }
        public String getCancionAutor() { return cancionAutor; }
        public void setCancionAutor(String cancionAutor) { this.cancionAutor = cancionAutor; }
        public String getCancionEnlace() { return cancionEnlace; }
        public void setCancionEnlace(String cancionEnlace) { this.cancionEnlace = cancionEnlace; }
        public Long getDirector1Id() { return director1Id; }
        public void setDirector1Id(Long director1Id) { this.director1Id = director1Id; }
        public String getDirector1Nombre() { return director1Nombre; }
        public void setDirector1Nombre(String director1Nombre) { this.director1Nombre = director1Nombre; }
        public Long getDirector2Id() { return director2Id; }
        public void setDirector2Id(Long director2Id) { this.director2Id = director2Id; }
        public String getDirector2Nombre() { return director2Nombre; }
        public void setDirector2Nombre(String director2Nombre) { this.director2Nombre = director2Nombre; }
    }
}
