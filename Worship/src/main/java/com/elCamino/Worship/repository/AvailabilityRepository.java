package com.elCamino.Worship.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elCamino.Worship.model.Availability;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByMiembro_Id(Long miembroId);

    List<Availability> findByServicio_Id(Long servicioId);
}
