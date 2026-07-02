package com.clinicmanager.service;

import com.clinicmanager.dto.AppointmentRequest;
import com.clinicmanager.dto.AppointmentResponse;
import com.clinicmanager.entity.Appointment;
import com.clinicmanager.entity.AppointmentStatus;
import com.clinicmanager.entity.Patient;
import com.clinicmanager.exception.ResourceNotFoundException;
import com.clinicmanager.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;

    public AppointmentService(AppointmentRepository appointmentRepository, PatientService patientService) {
        this.appointmentRepository = appointmentRepository;
        this.patientService = patientService;
    }

    public AppointmentResponse create(AppointmentRequest request) {
        Patient patient = patientService.getPatientOrThrow(request.getPatientId());
        AppointmentStatus status = request.getStatus() != null ? request.getStatus() : AppointmentStatus.SCHEDULED;
        Appointment appointment = new Appointment(patient, request.getDateTime(), request.getReason(), status);
        return new AppointmentResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> findAll() {
        return appointmentRepository.findAll().stream().map(AppointmentResponse::new).toList();
    }

    public AppointmentResponse findById(Long id) {
        return new AppointmentResponse(getAppointmentOrThrow(id));
    }

    public AppointmentResponse update(Long id, AppointmentRequest request) {
        Appointment appointment = getAppointmentOrThrow(id);
        Patient patient = patientService.getPatientOrThrow(request.getPatientId());
        appointment.setPatient(patient);
        appointment.setDateTime(request.getDateTime());
        appointment.setReason(request.getReason());
        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
        }
        return new AppointmentResponse(appointmentRepository.save(appointment));
    }

    public void delete(Long id) {
        Appointment appointment = getAppointmentOrThrow(id);
        appointmentRepository.delete(appointment);
    }

    private Appointment getAppointmentOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id " + id));
    }
}
