package com.elCamino.Worship.controller;

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

import com.elCamino.Worship.model.Member;
import com.elCamino.Worship.repository.MemberRepository;

@RestController //control de peticiones http
@RequestMapping("/api/miembros")
@CrossOrigin(origins = "*") // Permite que Angular (u otros) accedan
public class MemberController {

    private final MemberRepository repository;

    public MemberController(MemberRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Member> getAllMembers() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Member createMember(@RequestBody Member newMember) {
        return repository.save(newMember);
    }

    // ✅ Actualizar un miembro por ID
    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Long id, @RequestBody Member updatedMember) {
        Optional<Member> optionalMember = repository.findById(id);

        if (optionalMember.isPresent()) {
            Member existingMember = optionalMember.get();

            // Se actualizan los campos con los nuevos datos
            existingMember.setNombre(updatedMember.getNombre());
            existingMember.setApellido(updatedMember.getApellido());
            existingMember.setAlias(updatedMember.getAlias());
            existingMember.setIdentificacion(updatedMember.getIdentificacion());
            existingMember.setFecNacimiento(updatedMember.getFecNacimiento());
            existingMember.setSexo(updatedMember.getSexo());
            existingMember.setCorreo(updatedMember.getCorreo());
            existingMember.setCelular(updatedMember.getCelular());
            existingMember.setRol(updatedMember.getRol());
            existingMember.setActivo(updatedMember.getActivo());
            existingMember.setObservaciones(updatedMember.getObservaciones());

            // Se guarda y retorna la respuesta
            Member saved = repository.save(existingMember);
            return ResponseEntity.ok(saved);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}
