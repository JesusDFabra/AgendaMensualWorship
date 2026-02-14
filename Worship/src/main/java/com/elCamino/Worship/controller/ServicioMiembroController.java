package com.elCamino.Worship.controller;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.elCamino.Worship.model.Availability;
import com.elCamino.Worship.model.Member;
import com.elCamino.Worship.model.Rol;
import com.elCamino.Worship.model.ServicioMiembro;
import com.elCamino.Worship.model.Service;
import com.elCamino.Worship.repository.AvailabilityRepository;
import com.elCamino.Worship.repository.MemberRepository;
import com.elCamino.Worship.repository.ServicioMiembroRepository;
import com.elCamino.Worship.repository.ServiceRepository;

@RestController
@RequestMapping("/api/servicio")
@CrossOrigin(origins = "*")
public class ServicioMiembroController {

    private static final String ROL_VOZ = "Voz";
    private static final int MAX_VOCES = 5;

    private final ServiceRepository serviceRepository;
    private final ServicioMiembroRepository asignacionRepository;
    private final MemberRepository memberRepository;
    private final AvailabilityRepository availabilityRepository;

    public ServicioMiembroController(
            ServiceRepository serviceRepository,
            ServicioMiembroRepository asignacionRepository,
            MemberRepository memberRepository,
            AvailabilityRepository availabilityRepository) {
        this.serviceRepository = serviceRepository;
        this.asignacionRepository = asignacionRepository;
        this.memberRepository = memberRepository;
        this.availabilityRepository = availabilityRepository;
    }

    /**
     * Lista las asignaciones de un servicio (quién está asignado; el rol viene del miembro).
     */
    @GetMapping("/{servicioId}/asignaciones")
    public ResponseEntity<List<AsignacionDto>> getAsignaciones(@PathVariable Long servicioId) {
        if (!serviceRepository.existsById(servicioId)) {
            return ResponseEntity.notFound().build();
        }
        List<ServicioMiembro> list = asignacionRepository.findByServicio_Id(servicioId);
        List<AsignacionDto> dtos = list.stream()
                .map(sm -> toDto(sm))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Miembros disponibles para un rol en este servicio: tienen ese rol, están activos,
     * no tienen novedad ese día y no están ya asignados a este servicio.
     */
    @GetMapping("/{servicioId}/disponibles")
    public ResponseEntity<List<Member>> getDisponibles(
            @PathVariable Long servicioId,
            @RequestParam Long rolId) {
        if (!serviceRepository.existsById(servicioId)) {
            return ResponseEntity.notFound().build();
        }
        List<Member> conRol = memberRepository.findByRol_IdAndActivoTrue(rolId);
        Set<Long> conNovedad = availabilityRepository.findByServicio_Id(servicioId).stream()
                .map(a -> a.getMiembro().getId())
                .collect(Collectors.toSet());
        Set<Long> yaAsignados = asignacionRepository.findByServicio_Id(servicioId).stream()
                .map(sm -> sm.getMiembro().getId())
                .collect(Collectors.toSet());
        List<Member> disponibles = conRol.stream()
                .filter(m -> !conNovedad.contains(m.getId()) && !yaAsignados.contains(m.getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(disponibles);
    }

    /**
     * Asigna un miembro al servicio. El rol se toma del miembro.
     * Regla: 1 por instrumento (Batería, Guitarra, Bajo, Piano), hasta 5 Voces.
     */
    @PostMapping("/{servicioId}/asignaciones")
    public ResponseEntity<?> addAsignacion(
            @PathVariable Long servicioId,
            @RequestBody AsignarBody body) {
        if (body == null || body.getMiembroId() == null) {
            return ResponseEntity.badRequest().body("Falta miembroId");
        }
        Service servicio = serviceRepository.findById(servicioId).orElse(null);
        if (servicio == null) {
            return ResponseEntity.notFound().build();
        }
        Member miembro = memberRepository.findById(body.getMiembroId()).orElse(null);
        if (miembro == null) {
            return ResponseEntity.notFound().build();
        }
        if (miembro.getRol() == null) {
            return ResponseEntity.badRequest().body("El miembro no tiene rol asignado");
        }
        if (asignacionRepository.existsByServicio_IdAndMiembro_Id(servicioId, body.getMiembroId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("El miembro ya está asignado a este servicio");
        }
        Rol rol = miembro.getRol();
        long countRol = asignacionRepository.findByServicio_Id(servicioId).stream()
                .filter(sm -> sm.getMiembro().getRol() != null && rol.getId().equals(sm.getMiembro().getRol().getId()))
                .count();
        if (ROL_VOZ.equalsIgnoreCase(rol.getNombre())) {
            if (countRol >= MAX_VOCES) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya hay " + MAX_VOCES + " voces asignadas");
            }
        } else {
            if (countRol >= 1) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya hay alguien asignado a " + rol.getNombre());
            }
        }
        ServicioMiembro sm = new ServicioMiembro();
        sm.setServicio(servicio);
        sm.setMiembro(miembro);
        sm = asignacionRepository.save(sm);
        return ResponseEntity.ok(toDto(sm));
    }

    @DeleteMapping("/{servicioId}/asignaciones/{miembroId}")
    public ResponseEntity<Void> removeAsignacion(
            @PathVariable Long servicioId,
            @PathVariable Long miembroId) {
        List<ServicioMiembro> list = asignacionRepository.findByServicio_Id(servicioId);
        ServicioMiembro found = list.stream()
                .filter(sm -> sm.getMiembro().getId().equals(miembroId))
                .findFirst()
                .orElse(null);
        if (found == null) {
            return ResponseEntity.notFound().build();
        }
        asignacionRepository.delete(found);
        return ResponseEntity.noContent().build();
    }

    private static AsignacionDto toDto(ServicioMiembro sm) {
        Member m = sm.getMiembro();
        String nombreCompleto = (m.getNombre() != null ? m.getNombre() : "") + " " + (m.getApellido() != null ? m.getApellido() : "").trim();
        String alias = m.getAlias();
        String rolNombre = m.getRol() != null ? m.getRol().getNombre() : null;
        Long rolId = m.getRol() != null ? m.getRol().getId() : null;
        return new AsignacionDto(sm.getId(), sm.getServicio().getId(), m.getId(), nombreCompleto.trim(), alias, rolNombre, rolId);
    }

    public static final class AsignacionDto {
        private Long id;
        private Long servicioId;
        private Long miembroId;
        private String nombreCompleto;
        private String alias;
        private String rolNombre;
        private Long rolId;

        public AsignacionDto(Long id, Long servicioId, Long miembroId, String nombreCompleto, String alias, String rolNombre, Long rolId) {
            this.id = id;
            this.servicioId = servicioId;
            this.miembroId = miembroId;
            this.nombreCompleto = nombreCompleto;
            this.alias = alias;
            this.rolNombre = rolNombre;
            this.rolId = rolId;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getServicioId() { return servicioId; }
        public void setServicioId(Long servicioId) { this.servicioId = servicioId; }
        public Long getMiembroId() { return miembroId; }
        public void setMiembroId(Long miembroId) { this.miembroId = miembroId; }
        public String getNombreCompleto() { return nombreCompleto; }
        public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
        public String getAlias() { return alias; }
        public void setAlias(String alias) { this.alias = alias; }
        public String getRolNombre() { return rolNombre; }
        public void setRolNombre(String rolNombre) { this.rolNombre = rolNombre; }
        public Long getRolId() { return rolId; }
        public void setRolId(Long rolId) { this.rolId = rolId; }
    }

    public static final class AsignarBody {
        private Long miembroId;

        public Long getMiembroId() { return miembroId; }
        public void setMiembroId(Long miembroId) { this.miembroId = miembroId; }
    }
}
