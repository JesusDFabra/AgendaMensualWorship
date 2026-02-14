package com.elCamino.Worship.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.elCamino.Worship.model.ServicioCancion;

public interface ServicioCancionRepository extends JpaRepository<ServicioCancion, Long> {

    @Query("SELECT sc FROM ServicioCancion sc "
            + "LEFT JOIN FETCH sc.cancion "
            + "LEFT JOIN FETCH sc.director1 "
            + "LEFT JOIN FETCH sc.director2 "
            + "WHERE sc.servicio.id = :servicioId ORDER BY sc.id")
    List<ServicioCancion> findByServicio_IdOrderById(Long servicioId);

    @Query("SELECT sc FROM ServicioCancion sc "
            + "LEFT JOIN FETCH sc.cancion "
            + "LEFT JOIN FETCH sc.director1 "
            + "LEFT JOIN FETCH sc.director2 "
            + "WHERE sc.id = :id")
    Optional<ServicioCancion> findByIdWithAssociations(Long id);
}
