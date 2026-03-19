package com.elCamino.Worship.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elCamino.Worship.model.HistoricoDevocional;

public interface HistoricoDevocionalRepository extends JpaRepository<HistoricoDevocional, Long> {

    Optional<HistoricoDevocional> findTopByServicio_IdOrderByIdDesc(Long servicioId);

    void deleteByServicio_Id(Long servicioId);
}

