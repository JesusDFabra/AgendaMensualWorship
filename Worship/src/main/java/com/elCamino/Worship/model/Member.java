package com.elCamino.Worship.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "miembro")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String apellido;
    private String alias;
    private String identificacion;

    @Column(name = "fec_nacimiento")
    private LocalDate fecNacimiento;

    @ManyToOne
	@JoinColumn(name = "sexo_id")
	private Sexo sexo;

    private String correo;
    private String celular;

	@ManyToOne
    @JoinColumn(name = "rol_id")
    private Rol rol;

    private Boolean activo;
    private String observaciones;

    // @Column(name = "fotoURL")
    // private String fotoUrlTemporal;


	//Getters y Setters

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getApellido() {
		return apellido;
	}

	public void setApellido(String apellido) {
		this.apellido = apellido;
	}

	public String getAlias() {
		return alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	public String getIdentificacion() {
		return identificacion;
	}

	public void setIdentificacion(String identificacion) {
		this.identificacion = identificacion;
	}

	public LocalDate getFecNacimiento() {
		return fecNacimiento;
	}

	public void setFecNacimiento(LocalDate fecNacimiento) {
		this.fecNacimiento = fecNacimiento;
	}

	public String getCorreo() {
		return correo;
	}

	public void setCorreo(String correo) {
		this.correo = correo;
	}

	public String getCelular() {
		return celular;
	}

	public void setCelular(String celular) {
		this.celular = celular;
	}

	public Sexo getSexo() {
		return sexo;
	}

	public void setSexo(Sexo sexo) {
		this.sexo = sexo;
	}

	public Rol getRol() {
		return rol;
	}

	public void setRol(Rol rol) {
		this.rol = rol;
	}

	public Boolean getActivo() {
		return activo;
	}

	public void setActivo(Boolean activo) {
		this.activo = activo;
	}

	public String getObservaciones() {
		return observaciones;
	}

	public void setObservaciones(String observaciones) {
		this.observaciones = observaciones;
	}

	// public String getFotoUrlTemporal() {
	// 	return fotoUrlTemporal;
	// }

	// public void setFotoUrlTemporal(String fotoUrlTemporal) {
	// 	this.fotoUrlTemporal = fotoUrlTemporal;
	// }

	

	
}
