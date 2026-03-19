package com.elCamino.Worship.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elCamino.Worship.model.HistoricoDevocional;
import com.elCamino.Worship.model.Member;
import com.elCamino.Worship.model.Service;
import com.elCamino.Worship.repository.HistoricoDevocionalRepository;
import com.elCamino.Worship.repository.MemberRepository;
import com.elCamino.Worship.repository.ServicioMiembroRepository;
import com.elCamino.Worship.repository.ServiceRepository;

@RestController
@RequestMapping("/api/servicio")
@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }
)
public class DevocionalController {

    private final HistoricoDevocionalRepository devocionalRepository;
    private final ServicioMiembroRepository servicioMiembroRepository;
    private final MemberRepository memberRepository;
    private final ServiceRepository serviceRepository;

    public DevocionalController(
            HistoricoDevocionalRepository devocionalRepository,
            ServicioMiembroRepository servicioMiembroRepository,
            MemberRepository memberRepository,
            ServiceRepository serviceRepository) {
        this.devocionalRepository = devocionalRepository;
        this.servicioMiembroRepository = servicioMiembroRepository;
        this.memberRepository = memberRepository;
        this.serviceRepository = serviceRepository;
    }

    @GetMapping("/{servicioId}/devocional")
    public ResponseEntity<DevocionalDto> getDevocional(@PathVariable Long servicioId) {
        Optional<HistoricoDevocional> optional = devocionalRepository.findTopByServicio_IdOrderByIdDesc(servicioId);
        if (optional.isEmpty()) {
            return ResponseEntity.ok(DevocionalDto.unassigned(servicioId));
        }

        HistoricoDevocional hd = optional.get();
        Member m = hd.getMiembro();
        Long miembroId = m != null ? m.getId() : null;

        // Regla: si el miembro ya no está asignado al servicio, se muestra como sin asignar.
        if (miembroId == null || !servicioMiembroRepository.existsByServicio_IdAndMiembro_Id(servicioId, miembroId)) {
            return ResponseEntity.ok(DevocionalDto.unassigned(servicioId));
        }

        return ResponseEntity.ok(DevocionalDto.assigned(servicioId, m));
    }

    @PutMapping("/{servicioId}/devocional")
    public ResponseEntity<?> setDevocional(
            @PathVariable Long servicioId,
            @RequestBody DevocionalSetBody body) {

        if (body == null) {
            return ResponseEntity.badRequest().body("Falta body");
        }

        if (body.miembroId == null) {
            devocionalRepository.deleteByServicio_Id(servicioId);
            return ResponseEntity.ok(DevocionalDto.unassigned(servicioId));
        }

        Long miembroId = body.miembroId;

        // Validación: solo se puede marcar devocional a quien esté asignado (agendado) al servicio.
        if (!servicioMiembroRepository.existsByServicio_IdAndMiembro_Id(servicioId, miembroId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("El miembro no está asignado a este servicio, no puede ser el encargado del devocional.");
        }

        Optional<Service> servicioOpt = serviceRepository.findById(servicioId);
        if (servicioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<Member> miembroOpt = memberRepository.findById(miembroId);
        if (miembroOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Asegura 1 solo registro "activo" por servicio.
        devocionalRepository.deleteByServicio_Id(servicioId);

        HistoricoDevocional hd = new HistoricoDevocional();
        hd.setServicio(servicioOpt.get());
        hd.setMiembro(miembroOpt.get());
        devocionalRepository.save(hd);

        return ResponseEntity.ok(DevocionalDto.assigned(servicioId, miembroOpt.get()));
    }

    @DeleteMapping("/{servicioId}/devocional")
    public ResponseEntity<Void> clearDevocional(@PathVariable Long servicioId) {
        devocionalRepository.deleteByServicio_Id(servicioId);
        return ResponseEntity.noContent().build();
    }

    public static final class DevocionalSetBody {
        public Long miembroId;
    }

    public static final class DevocionalDto {
        public Long servicioId;
        public Long miembroId;
        public String miembroAlias;
        public String miembroNombreCompleto;

        public static DevocionalDto unassigned(Long servicioId) {
            DevocionalDto dto = new DevocionalDto();
            dto.servicioId = servicioId;
            dto.miembroId = null;
            dto.miembroAlias = null;
            dto.miembroNombreCompleto = null;
            return dto;
        }

        public static DevocionalDto assigned(Long servicioId, Member m) {
            DevocionalDto dto = new DevocionalDto();
            dto.servicioId = servicioId;
            dto.miembroId = m.getId();
            dto.miembroAlias = m.getAlias();
            String nombreCompleto = (m.getNombre() != null ? m.getNombre() : "")
                    + " "
                    + (m.getApellido() != null ? m.getApellido() : "")
                    .trim();
            dto.miembroNombreCompleto = nombreCompleto.trim().isEmpty() ? null : nombreCompleto.trim();
            return dto;
        }
    }
}

