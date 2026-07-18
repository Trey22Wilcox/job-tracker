package com.treydev.job_tracker.controller;

import com.treydev.job_tracker.dto.ResumeAnalysisRequest;
import com.treydev.job_tracker.dto.ResumeAnalysisResult;
import com.treydev.job_tracker.exception.ClaudeApiException;
import com.treydev.job_tracker.exception.ResumeFileNotFoundException;
import com.treydev.job_tracker.service.RateLimiterService;
import com.treydev.job_tracker.service.ResumeAnalysisService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeAnalysisController {

    private final ResumeAnalysisService resumeAnalysisService;
    private final RateLimiterService rateLimiterService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(@RequestBody ResumeAnalysisRequest request, HttpServletRequest httpRequest) {
        String clientIp = resolveClientIp(httpRequest);

        if (!rateLimiterService.tryAcquire(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded: max 20 requests per hour per client"));
        }

        if (request == null || request.jobDescription() == null || request.jobDescription().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "jobDescription must not be blank"));
        }

        ResumeAnalysisResult result = resumeAnalysisService.analyze(request.jobDescription());
        return ResponseEntity.ok(result);
    }

    @ExceptionHandler(ResumeFileNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResumeNotFound(ResumeFileNotFoundException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(ClaudeApiException.class)
    public ResponseEntity<Map<String, String>> handleClaudeApiException(ClaudeApiException e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of("error", e.getMessage()));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
