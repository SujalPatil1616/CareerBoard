package com.sujal.jobtracker.controller;

import com.sujal.jobtracker.dto.JobApplicationRequest;
import com.sujal.jobtracker.model.JobApplication;
import com.sujal.jobtracker.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173"})
@RequestMapping("/api/applications")
public class JobApplicationController {
    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<JobApplication> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public JobApplication findById(@PathVariable long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(@Valid @RequestBody JobApplicationRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public JobApplication update(@PathVariable long id,
                                 @Valid @RequestBody JobApplicationRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        service.delete(id);
    }
}
