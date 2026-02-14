package com.elCamino.Worship.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "servicio_cancion")
public class ServicioCancion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "servicio_id", nullable = false)
    private Service servicio;

    @ManyToOne
    @JoinColumn(name = "cancion_id", nullable = false)
    private Cancion cancion;

    /** Quien dirige la canción (opcional; puede haber uno o dos). */
    @ManyToOne
    @JoinColumn(name = "director_1")
    private Member director1;

    @ManyToOne
    @JoinColumn(name = "director_2")
    private Member director2;

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

    public Cancion getCancion() {
        return cancion;
    }

    public void setCancion(Cancion cancion) {
        this.cancion = cancion;
    }

    public Member getDirector1() {
        return director1;
    }

    public void setDirector1(Member director1) {
        this.director1 = director1;
    }

    public Member getDirector2() {
        return director2;
    }

    public void setDirector2(Member director2) {
        this.director2 = director2;
    }
}
