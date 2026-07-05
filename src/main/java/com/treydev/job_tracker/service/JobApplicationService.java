package com.treydev.job_tracker.service;

import com.treydev.job_tracker.model.JobApplication;
import com.treydev.job_tracker.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;

    public List<JobApplication> getAllApplications() {
        return jobApplicationRepository.findAll();
    }

    public Optional<JobApplication> getApplicationById(Long id) {
        return jobApplicationRepository.findById(id);
    }

    public JobApplication createApplication(JobApplication jobApplication) {
        return jobApplicationRepository.save(jobApplication);
    }

    public JobApplication updateApplication(Long id, JobApplication updated) {
        updated.setId(id);
        return jobApplicationRepository.save(updated);
    }

    public void deleteApplication(Long id) {
        jobApplicationRepository.deleteById(id);
    }
}
