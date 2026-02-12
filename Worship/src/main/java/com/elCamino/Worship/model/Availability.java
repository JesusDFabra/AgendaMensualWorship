package com.elCamino.Worship.model;

import java.time.LocalDate;

import org.antlr.v4.runtime.misc.NotNull;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "novedades",
    uniqueConstraints = @UniqueConstraint(name = "uk_member_service", columnNames = {"miembro_id", "servicio_id"})
)
// Disponibilidad
public class Availability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "miembro_id", nullable = false)
    private Member miembro;

    @ManyToOne
    @JoinColumn(name = "servicio_id", nullable = false)
    private Service  servicio;

    private String observacion;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @PrePersist
    public void prePersist() {
        if (fechaRegistro == null) fechaRegistro = LocalDate.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Service getServicio() {
        return servicio;
    }

    public void setServicio(Service servicio) {
        this.servicio = servicio;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public Member getMiembro() {
        return miembro;
    }

    public void setMiembro(Member miembro) {
        this.miembro = miembro;
    }


}
