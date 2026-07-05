package com.treydev.job_tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "job_applications")
public class JobApplication {

    //to auto-increment id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //company name cannot be false
    @Column(nullable = false)
    @NotBlank(message = "Company name is required")
    private String company;

    //job title cannot be false
    @Column(nullable = false)
    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @URL(message = "Must be a valid URL")
    private String jobPostingURL;
    private String notes;
    private LocalDate appliedDate;
    private LocalDate lastUpdated;

    public enum Status {
        APPLIED,
        PHONE_SCREEN,
        INTERVIEW,
        OFFER,
        REJECTED
    }
}
