package com.elCamino.Worship.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.elCamino.Worship.model.PaletaColores;
import com.elCamino.Worship.repository.PaletaColoresRepository;

@RestController
@RequestMapping("/api/paleta-colores")
@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = { RequestMethod.GET, RequestMethod.OPTIONS }
)
public class PaletaColoresController {

    private final PaletaColoresRepository repository;

    public PaletaColoresController(PaletaColoresRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<PaletaColores>> listar() {
        return ResponseEntity.ok(repository.findAll());
    }
}
