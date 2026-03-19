package com.elCamino.Worship.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "historico_devocional")
public class HistoricoDevocional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "servicio_id", nullable = false)
    private Service servicio;

    @ManyToOne
    @JoinColumn(name = "miembro_id", nullable = false)
    private Member miembro;

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

    public Member getMiembro() {
        return miembro;
    }

    public void setMiembro(Member miembro) {
        this.miembro = miembro;
    }
}

