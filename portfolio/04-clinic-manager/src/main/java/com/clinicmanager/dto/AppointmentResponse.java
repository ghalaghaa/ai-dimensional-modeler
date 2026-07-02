package com.clinicmanager.dto;

import com.clinicmanager.entity.Appointment;
import com.clinicmanager.entity.AppointmentStatus;

import java.time.LocalDateTime;

public class AppointmentResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private LocalDateTime dateTime;
    private String reason;
    private AppointmentStatus status;

    public AppointmentResponse() {
    }

    public AppointmentResponse(Appointment appointment) {
        this.id = appointment.getId();
        this.patientId = appointment.getPatient().getId();
        this.patientName = appointment.getPatient().getFullName();
        this.dateTime = appointment.getDateTime();
        this.reason = appointment.getReason();
        this.status = appointment.getStatus();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
}
