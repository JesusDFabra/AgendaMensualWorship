package com.elCamino.Worship.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.elCamino.Worship.model.Service;

public interface ServiceRepository extends JpaRepository<Service, Long> {

}
