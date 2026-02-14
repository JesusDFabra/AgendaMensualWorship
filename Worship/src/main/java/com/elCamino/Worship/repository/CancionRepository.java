package com.elCamino.Worship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.elCamino.Worship.model.Cancion;

public interface CancionRepository extends JpaRepository<Cancion, Long> {

    List<Cancion> findAllByOrderByNombreAsc();

    /** Busca por nombre (case-insensitive, contiene). */
    List<Cancion> findByNombreContainingIgnoreCaseOrderByNombreAsc(String nombre);

    /** Busca por nombre exacto (trim, ignore case) para evitar duplicados. */
    @Query("SELECT c FROM Cancion c WHERE LOWER(TRIM(c.nombre)) = LOWER(:nombre)")
    List<Cancion> findByNombreTrimmedIgnoreCase(@Param("nombre") String nombre);
}
