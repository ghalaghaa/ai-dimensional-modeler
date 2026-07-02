package com.clinicmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.clinicmanager.dto.AppointmentRequest;
import com.clinicmanager.dto.PatientRequest;
import com.clinicmanager.entity.AppointmentStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Long createPatient() throws Exception {
        PatientRequest patientRequest = new PatientRequest();
        patientRequest.setFullName("John Smith");
        patientRequest.setPhone("555-0199");
        patientRequest.setDateOfBirth(LocalDate.of(1985, 3, 15));

        String response = mockMvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patientRequest)))
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).get("id").asLong();
    }

    private AppointmentRequest validRequest(Long patientId) {
        AppointmentRequest request = new AppointmentRequest();
        request.setPatientId(patientId);
        request.setDateTime(LocalDateTime.now().plusDays(1));
        request.setReason("Annual checkup");
        return request;
    }

    @Test
    void createAppointment_returnsCreatedAppointmentWithScheduledStatus() throws Exception {
        Long patientId = createPatient();

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest(patientId))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.patientId").value(patientId))
                .andExpect(jsonPath("$.status").value(AppointmentStatus.SCHEDULED.name()))
                .andExpect(jsonPath("$.reason").value("Annual checkup"));
    }

    @Test
    void createAppointment_withUnknownPatient_returnsNotFound() throws Exception {
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest(999_999L))))
                .andExpect(status().isNotFound());
    }

    @Test
    void createAppointment_withBlankReason_returnsBadRequest() throws Exception {
        Long patientId = createPatient();
        AppointmentRequest request = validRequest(patientId);
        request.setReason(" ");

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.reason").exists());
    }

    @Test
    void createAppointment_withMissingPatientId_returnsBadRequest() throws Exception {
        AppointmentRequest request = new AppointmentRequest();
        request.setDateTime(LocalDateTime.now().plusDays(1));
        request.setReason("Follow-up");

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAppointmentById_whenExists_returnsAppointment() throws Exception {
        Long patientId = createPatient();
        String response = mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest(patientId))))
                .andReturn().getResponse().getContentAsString();

        Long appointmentId = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(get("/api/appointments/{id}", appointmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appointmentId));
    }

    @Test
    void getAppointmentById_whenMissing_returnsNotFound() throws Exception {
        mockMvc.perform(get("/api/appointments/{id}", 999_999))
                .andExpect(status().isNotFound());
    }

    @Test
    void listAppointments_returnsOk() throws Exception {
        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isOk());
    }
}
