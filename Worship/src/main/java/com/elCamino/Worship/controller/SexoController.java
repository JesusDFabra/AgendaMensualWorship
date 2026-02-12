package com.elCamino.Worship.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elCamino.Worship.model.Sexo;
import com.elCamino.Worship.repository.SexoRepository;

@RestController
@RequestMapping("/api/sexos")
@CrossOrigin(origins = "*")
public class SexoController {

    private final SexoRepository repository;

    public SexoController(SexoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Sexo> getAll() {
        return repository.findAll();
    }
}
