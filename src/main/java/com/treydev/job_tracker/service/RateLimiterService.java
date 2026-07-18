package com.treydev.job_tracker.service;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Simple in-memory sliding-window rate limiter keyed by client IP.
 * Not shared across instances - fine for a single-node deployment only.
 */
@Component
public class RateLimiterService {

    private static final int MAX_REQUESTS_PER_WINDOW = 20;
    private static final Duration WINDOW = Duration.ofHours(1);

    private final ConcurrentHashMap<String, Deque<Instant>> requestTimestamps = new ConcurrentHashMap<>();

    public boolean tryAcquire(String clientIp) {
        Deque<Instant> timestamps = requestTimestamps.computeIfAbsent(clientIp, key -> new ConcurrentLinkedDeque<>());
        Instant now = Instant.now();
        Instant cutoff = now.minus(WINDOW);

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(cutoff)) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= MAX_REQUESTS_PER_WINDOW) {
                return false;
            }
            timestamps.addLast(now);
            return true;
        }
    }
}
