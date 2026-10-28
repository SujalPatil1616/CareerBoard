package com.sujal.jobtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record JobApplicationRequest(
        @NotBlank(message = "Company is required")
        @Size(max = 120, message = "Company must be 120 characters or fewer")
        String company,

        @NotBlank(message = "Role is required")
        @Size(max = 120, message = "Role must be 120 characters or fewer")
        String role,

        @Size(max = 500, message = "Job URL must be 500 characters or fewer")
        String jobUrl,

        @NotBlank(message = "Status is required")
        String status,

        LocalDate appliedDate,

        @Size(max = 2000, message = "Notes must be 2000 characters or fewer")
        String notes
) {}
