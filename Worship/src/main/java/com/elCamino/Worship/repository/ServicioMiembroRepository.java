package com.elCamino.Worship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elCamino.Worship.model.ServicioMiembro;

public interface ServicioMiembroRepository extends JpaRepository<ServicioMiembro, Long> {

    List<ServicioMiembro> findByServicio_Id(Long servicioId);

    boolean existsByServicio_IdAndMiembro_Id(Long servicioId, Long miembroId);
}
