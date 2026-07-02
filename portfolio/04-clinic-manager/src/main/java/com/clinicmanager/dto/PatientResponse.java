package com.clinicmanager.dto;

import com.clinicmanager.entity.Patient;

import java.time.LocalDate;

public class PatientResponse {

    private Long id;
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;

    public PatientResponse() {
    }

    public PatientResponse(Patient patient) {
        this.id = patient.getId();
        this.fullName = patient.getFullName();
        this.phone = patient.getPhone();
        this.dateOfBirth = patient.getDateOfBirth();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
}
