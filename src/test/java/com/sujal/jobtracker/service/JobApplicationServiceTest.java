package com.sujal.jobtracker.service;

import com.sujal.jobtracker.dto.JobApplicationRequest;
import com.sujal.jobtracker.model.JobApplication;
import com.sujal.jobtracker.repository.JobApplicationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {
    @Mock
    JobApplicationRepository repository;

    @InjectMocks
    JobApplicationService service;

    @Test
    void createNormalizesStatusAndTrimsCompany() {
        JobApplication expected = new JobApplication(1L, "Acme", "Developer", null,
                "APPLIED", LocalDate.of(2026, 10, 1), null, null);
        when(repository.create(anyString(), anyString(), isNull(), eq("APPLIED"),
                any(LocalDate.class), isNull())).thenReturn(expected);

        JobApplication actual = service.create(new JobApplicationRequest(
                " Acme ", "Developer", null, "applied",
                LocalDate.of(2026, 10, 1), null));

        assertEquals("Acme", actual.company());
        assertEquals("APPLIED", actual.status());
    }

    @Test
    void createRejectsUnknownStatus() {
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> service.create(new JobApplicationRequest(
                        "Acme", "Developer", null, "UNKNOWN", null, null)));
        verifyNoInteractions(repository);
    }
}
