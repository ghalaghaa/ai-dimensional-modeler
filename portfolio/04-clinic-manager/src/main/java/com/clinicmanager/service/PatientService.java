package com.clinicmanager.service;

import com.clinicmanager.dto.PatientRequest;
import com.clinicmanager.dto.PatientResponse;
import com.clinicmanager.entity.Patient;
import com.clinicmanager.exception.ResourceNotFoundException;
import com.clinicmanager.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public PatientResponse create(PatientRequest request) {
        Patient patient = new Patient(request.getFullName(), request.getPhone(), request.getDateOfBirth());
        return new PatientResponse(patientRepository.save(patient));
    }

    public List<PatientResponse> findAll() {
        return patientRepository.findAll().stream().map(PatientResponse::new).toList();
    }

    public PatientResponse findById(Long id) {
        return new PatientResponse(getPatientOrThrow(id));
    }

    public PatientResponse update(Long id, PatientRequest request) {
        Patient patient = getPatientOrThrow(id);
        patient.setFullName(request.getFullName());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        return new PatientResponse(patientRepository.save(patient));
    }

    public void delete(Long id) {
        Patient patient = getPatientOrThrow(id);
        patientRepository.delete(patient);
    }

    public Patient getPatientOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + id));
    }
}
