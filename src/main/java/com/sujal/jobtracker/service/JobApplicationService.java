package com.sujal.jobtracker.service;

import com.sujal.jobtracker.dto.JobApplicationRequest;
import com.sujal.jobtracker.model.JobApplication;
import com.sujal.jobtracker.repository.JobApplicationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
public class JobApplicationService {
    private static final Set<String> STATUSES =
            Set.of("APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN");

    private final JobApplicationRepository repository;

    public JobApplicationService(JobApplicationRepository repository) {
        this.repository = repository;
    }

    public List<JobApplication> findAll() {
        return repository.findAll();
    }

    public JobApplication findById(long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Job application " + id + " was not found"));
    }

    public JobApplication create(JobApplicationRequest request) {
        String status = normalizeStatus(request.status());
        LocalDate date = request.appliedDate() == null ? LocalDate.now() : request.appliedDate();
        return repository.create(request.company().trim(), request.role().trim(),
                clean(request.jobUrl()), status, date, clean(request.notes()));
    }

    public JobApplication update(long id, JobApplicationRequest request) {
        findById(id);
        boolean updated = repository.update(id, request.company().trim(), request.role().trim(),
                clean(request.jobUrl()), normalizeStatus(request.status()),
                request.appliedDate(), clean(request.notes()));
        if (!updated) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job application was not found");
        }
        return findById(id);
    }

    public void delete(long id) {
        if (!repository.delete(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Job application " + id + " was not found");
        }
    }

    private String normalizeStatus(String status) {
        String normalized = status.trim().toUpperCase();
        if (!STATUSES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status must be one of: " + String.join(", ", STATUSES));
        }
        return normalized;
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
