package com.sujal.jobtracker.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record JobApplication(
        Long id,
        String company,
        String role,
        String jobUrl,
        String status,
        LocalDate appliedDate,
        String notes,
        LocalDateTime createdAt
) {}
