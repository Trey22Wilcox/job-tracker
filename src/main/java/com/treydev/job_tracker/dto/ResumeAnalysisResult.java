package com.treydev.job_tracker.dto;

import java.util.List;

public record ResumeAnalysisResult(
        int matchScore,
        List<String> strengths,
        List<String> gaps,
        String suggestion) {
}
