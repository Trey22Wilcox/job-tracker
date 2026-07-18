package com.treydev.job_tracker.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.models.messages.Base64PdfSource;
import com.anthropic.models.messages.ContentBlockParam;
import com.anthropic.models.messages.DocumentBlockParam;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.TextBlockParam;
import com.anthropic.models.messages.ContentBlock;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.treydev.job_tracker.dto.ResumeAnalysisResult;
import com.treydev.job_tracker.exception.ClaudeApiException;
import com.treydev.job_tracker.exception.ResumeFileNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.List;

@Service
public class ResumeAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(ResumeAnalysisService.class);

    private static final String MODEL = "claude-sonnet-5";
    private static final int MAX_TOKENS = 2000;
    private static final String RESUME_CLASSPATH_RESOURCE = "/resume.pdf";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String apiKey;
    private volatile AnthropicClient client;

    public ResumeAnalysisService(@Value("${claude.api.key}") String apiKey) {
        this.apiKey = apiKey;
    }

    private AnthropicClient getClient() {
        AnthropicClient result = client;
        if (result == null) {
            synchronized (this) {
                result = client;
                if (result == null) {
                    if (apiKey == null || apiKey.isBlank()) {
                        throw new ClaudeApiException(
                                "Claude API key is not configured (claude.api.key / CLAUDE_API_KEY)");
                    }
                    result = AnthropicOkHttpClient.builder().apiKey(apiKey).build();
                    client = result;
                }
            }
        }
        return result;
    }

    public ResumeAnalysisResult analyze(String jobDescription) {
        String base64Pdf = loadResumeAsBase64();

        MessageCreateParams params = MessageCreateParams.builder()
                .model(MODEL)
                .maxTokens(MAX_TOKENS)
                .addUserMessageOfBlockParams(List.of(
                        ContentBlockParam.ofDocument(DocumentBlockParam.builder()
                                .source(Base64PdfSource.builder().data(base64Pdf).build())
                                .build()),
                        ContentBlockParam.ofText(TextBlockParam.builder()
                                .text(buildPrompt(jobDescription))
                                .build())))
                .build();

        Message response;
        try {
            response = getClient().messages().create(params);
        } catch (AnthropicServiceException e) {
            throw new ClaudeApiException("Claude API request failed: " + e.getMessage(), e);
        } catch (RuntimeException e) {
            throw new ClaudeApiException("Failed to reach Claude API: " + e.getMessage(), e);
        }

        log.debug("Claude response stopReason={}, contentBlockCount={}",
                response.stopReason().map(Object::toString).orElse("<none>"),
                response.content().size());
        response.content().forEach(block -> log.debug("Claude response content block type={}", blockType(block)));

        String rawText = response.content().stream()
                .flatMap(block -> block.text().stream())
                .map(textBlock -> textBlock.text())
                .reduce("", String::concat);

        return parseResult(rawText, response.stopReason().map(Object::toString).orElse("<none>"));
    }

    private String blockType(ContentBlock block) {
        if (block.isText()) return "text";
        if (block.isThinking()) return "thinking";
        if (block.isRedactedThinking()) return "redacted_thinking";
        if (block.isToolUse()) return "tool_use";
        if (block.isServerToolUse()) return "server_tool_use";
        if (block.isWebSearchToolResult()) return "web_search_tool_result";
        if (block.isWebFetchToolResult()) return "web_fetch_tool_result";
        if (block.isCodeExecutionToolResult()) return "code_execution_tool_result";
        if (block.isBashCodeExecutionToolResult()) return "bash_code_execution_tool_result";
        if (block.isTextEditorCodeExecutionToolResult()) return "text_editor_code_execution_tool_result";
        if (block.isToolSearchToolResult()) return "tool_search_tool_result";
        if (block.isContainerUpload()) return "container_upload";
        return "unknown";
    }

    private String loadResumeAsBase64() {
        try (InputStream in = getClass().getResourceAsStream(RESUME_CLASSPATH_RESOURCE)) {
            if (in == null) {
                throw new ResumeFileNotFoundException(
                        "Resume PDF not found on classpath at " + RESUME_CLASSPATH_RESOURCE);
            }
            return Base64.getEncoder().encodeToString(in.readAllBytes());
        } catch (IOException e) {
            throw new ResumeFileNotFoundException("Failed to read resume PDF: " + e.getMessage());
        }
    }

    private String buildPrompt(String jobDescription) {
        return """
                You are an experienced technical recruiter screening a resume against a job \
                description. You are given the candidate's resume as an attached PDF and the \
                job description below.

                The candidate is early-career: a recent CS/SWE graduate with roughly a year of \
                applied experience from internships, a fellowship, and personal projects, and no \
                full-time SWE role yet. Evaluate them the way a good technical recruiter would, \
                not as a literal keyword-matcher:

                - Don't require exact tool-name matches. Look for evidence the candidate could \
                reasonably ramp up on a named technology based on adjacent or transferable \
                experience. For example, experience with distributed, containerized, or \
                API-driven systems is real signal toward an unfamiliar tool like Redis, a \
                message queue, or RPC, even without hands-on use of that exact tool.
                - Weigh demonstrated fundamentals, such as system design instincts, coding \
                practices, project complexity, and learning trajectory, alongside literal \
                keyword overlap. Keyword overlap alone should not drive the score.
                - Reserve match scores below roughly 40 for roles that clearly require \
                senior-level ownership, or deep specialized domain expertise the resume shows \
                genuinely no adjacent signal for at all. Do not score low simply because a \
                specific named tool is missing when related experience exists.

                Job description:
                %s

                Analyze how well the resume matches the job description. Respond with ONLY \
                valid JSON, no markdown code fences and no commentary, matching exactly this shape:
                {
                  "matchScore": <integer 0-100>,
                  "strengths": [<exactly 3 short strings>],
                  "gaps": [<exactly 2 short strings>],
                  "suggestion": "<one string with a concrete suggestion>"
                }
                """.formatted(jobDescription);
    }

    private ResumeAnalysisResult parseResult(String rawText, String stopReason) {
        String trimmed = rawText.trim();
        if (trimmed.isBlank()) {
            throw new ClaudeApiException(
                    "Claude returned no text content (stop_reason=" + stopReason + ")");
        }
        String json = stripCodeFences(trimmed);
        try {
            return objectMapper.readValue(json, ResumeAnalysisResult.class);
        } catch (IOException e) {
            throw new ClaudeApiException("Claude returned an unparsable response: " + e.getMessage(), e);
        }
    }

    private String stripCodeFences(String text) {
        if (text.startsWith("```")) {
            int firstNewline = text.indexOf('\n');
            if (firstNewline != -1) {
                text = text.substring(firstNewline + 1);
            }
            int lastFence = text.lastIndexOf("```");
            if (lastFence != -1) {
                text = text.substring(0, lastFence);
            }
        }
        return text.trim();
    }
}
