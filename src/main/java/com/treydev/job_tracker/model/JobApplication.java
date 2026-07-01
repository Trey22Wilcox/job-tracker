package com.treydev.job_tracker.model;

import jakarta.persistence.*;
import lombok.Data;
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
    private String company;

    //job title cannot be false
    @Column(nullable = false)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private String status;

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
