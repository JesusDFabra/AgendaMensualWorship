package com.elCamino.Worship.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elCamino.Worship.model.Rol;
import com.elCamino.Worship.repository.RolRepository;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RolController {

    private final RolRepository repository;

    public RolController(RolRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Rol> getAll() {
        return repository.findAll();
    }
}
