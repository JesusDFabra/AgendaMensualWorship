package com.elCamino.Worship.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.elCamino.Worship.model.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {

    List<Member> findByRol_IdAndActivoTrue(Long rolId);
}
