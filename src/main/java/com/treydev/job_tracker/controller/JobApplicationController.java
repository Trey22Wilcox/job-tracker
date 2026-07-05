package com.treydev.job_tracker.controller;

import com.treydev.job_tracker.model.JobApplication;
import com.treydev.job_tracker.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @GetMapping
    public List<JobApplication> getAllApplications() {
        return jobApplicationService.getAllApplications();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getApplicationById(@PathVariable Long id) {
        return jobApplicationService.getApplicationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public JobApplication createApplication(@Valid @RequestBody JobApplication jobApplication) {
        return jobApplicationService.createApplication(jobApplication);
    }

    @PutMapping("/{id}")
    public JobApplication updateApplication(@PathVariable Long id,@Valid @RequestBody JobApplication jobApplication) {
        return jobApplicationService.updateApplication(id, jobApplication);
    }

    @DeleteMapping({"/{id}"})
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
