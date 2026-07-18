package com.treydev.job_tracker.exception;

public class ClaudeApiException extends RuntimeException {
    public ClaudeApiException(String message, Throwable cause) {
        super(message, cause);
    }

    public ClaudeApiException(String message) {
        super(message);
    }
}
