package com.tcs.ilp.pharmacy.medisync.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ---------------------------------------------------------------------
    // 1) YOUR CUSTOM DOMAIN EXCEPTIONS (keep yours, but return clean ApiError)
    // ---------------------------------------------------------------------

    @ExceptionHandler(StoreNotFoundException.class)
    public ResponseEntity<ApiError> handleStoreNotFound(StoreNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), req);
    }

    @ExceptionHandler(InvalidBatchReferenceException.class)
    public ResponseEntity<ApiError> handleInvalidBatch(InvalidBatchReferenceException ex,
                                                       HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Invalid Reference", ex.getMessage(), req);
    }


    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex,
                                                   HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), req);
    }



    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), req);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiError> handleValidation(ValidationException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Validation Error", ex.getMessage(), req);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, "Conflict", safeMessage(ex, "Conflict occurred"), req);
    }

    // If you actually use ApiException anywhere, catch it properly:
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApiException(ApiException ex, HttpServletRequest req) {
        return build(ex.getStatus(), ex.getError(), safeMessage(ex, "Request failed"), req);
    }

    // ---------------------------------------------------------------------
    // 2) IMPORTANT: ResponseStatusException (your VendorService throws these)
    //    Without this, Spring returns default JSON with timestamp/traceId.
    // ---------------------------------------------------------------------

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException ex, HttpServletRequest req) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String msg = (ex.getReason() != null && !ex.getReason().isBlank())
                ? ex.getReason()
                : status.getReasonPhrase();

        return build(status, status.getReasonPhrase(), msg, req);
    }

    // ---------------------------------------------------------------------
    // 3) @Valid body validation — return ALL field errors (more detailed)
    // ---------------------------------------------------------------------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                 HttpServletRequest req) {

        List<ApiFieldError> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> new ApiFieldError(fe.getField(), fe.getDefaultMessage()))
                .toList();

        String summary = details.isEmpty()
                ? "Validation failed"
                : "Validation failed for " + details.size() + " field(s)";

        ApiError body = new ApiError("Validation Error", summary, path(req), details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // ---------------------------------------------------------------------
    // 4) Bad JSON: include a bit more detail but don’t leak internals
    // ---------------------------------------------------------------------

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleBadJson(HttpMessageNotReadableException ex, HttpServletRequest req) {
        String msg = "Invalid request body (malformed JSON).";
        Throwable root = ex.getMostSpecificCause();

        // add a small hint without exposing stack traces
        if (root != null && root.getMessage() != null) {
            String hint = root.getMessage();
            if (hint.length() > 180) hint = hint.substring(0, 180) + "...";
            msg = msg + " " + hint;
        }

        return build(HttpStatus.BAD_REQUEST, "Malformed JSON", msg, req);
    }

    // ---------------------------------------------------------------------
    // 5) Request parameter issues — slightly more descriptive
    // ---------------------------------------------------------------------

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex,
                                                       HttpServletRequest req) {
        String msg = "Missing required parameter: " + ex.getParameterName();
        return build(HttpStatus.BAD_REQUEST, "Missing Parameter", msg, req);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                       HttpServletRequest req) {
        String expected = (ex.getRequiredType() != null) ? ex.getRequiredType().getSimpleName() : "required type";
        String msg = "Parameter '" + ex.getName() + "' has invalid value. Expected " + expected + ".";
        return build(HttpStatus.BAD_REQUEST, "Type Mismatch", msg, req);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
                                                             HttpServletRequest req) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed", ex.getMessage(), req);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex,
                                                                HttpServletRequest req) {
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported Media Type", ex.getMessage(), req);
    }

    // ---------------------------------------------------------------------
    // 6) DB constraints — map to meaningful messages (email/gst/license)
    // ---------------------------------------------------------------------

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        String msg = mapConstraintMessage(ex);
        return build(HttpStatus.CONFLICT, "Conflict", msg, req);
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<ApiError> handleEmptyResult(EmptyResultDataAccessException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "Not Found", "Resource not found", req);
    }

    @ExceptionHandler({BadSqlGrammarException.class, SQLException.class})
    public ResponseEntity<ApiError> handleSql(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "SQL Error", "Database error occurred", req);
    }

    // ---------------------------------------------------------------------
    // 7) Simple common exceptions
    // ---------------------------------------------------------------------

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", safeMessage(ex, "Invalid request"), req);
    }

    @ExceptionHandler(UnsupportedOperationException.class)
    public ResponseEntity<ApiError> handleUnsupported(UnsupportedOperationException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_IMPLEMENTED, "Not Implemented", safeMessage(ex, "Not supported"), req);
    }

    // ---------------------------------------------------------------------
    // 8) Fallback — still no traceId/timestamp in body
    // ---------------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "Something went wrong. Please contact support.", req);
    }

    // -------------------- Helpers --------------------

    private ResponseEntity<ApiError> build(HttpStatus status, String error, String message, HttpServletRequest req) {
        ApiError body = new ApiError(error, message, path(req));
        return ResponseEntity.status(status).body(body);
    }

    private String path(HttpServletRequest req) {
        return (req != null) ? req.getRequestURI() : null;
    }

    private String safeMessage(Throwable ex, String fallback) {
        String msg = ex.getMessage();
        return (msg == null || msg.isBlank()) ? fallback : msg;
    }

    /**
     * Convert DB constraint failures into user-friendly messages.
     * Adjust matching strings based on your DB (MySQL/Postgres) constraint/index names.
     */
    private String mapConstraintMessage(DataIntegrityViolationException ex) {
        Throwable root = ex.getMostSpecificCause();
        String raw = (root != null && root.getMessage() != null) ? root.getMessage().toLowerCase() : "";

        // Email uniqueness in users table
        if (raw.contains("users") && raw.contains("email")) {
            return "Email already exists";
        }

        // Vendors uniqueness
        if (raw.contains("vendors") && raw.contains("gst")) {
            return "GST Number already exists";
        }
        if (raw.contains("vendors") && raw.contains("license")) {
            return "License Number already exists";
        }

        // Generic safe fallback
        return "Operation violates database constraints";
    }
}
