package com.tcs.ilp.pharmacy.medisync.exception;

import java.util.List;

public class ApiError {
    private String error;     // e.g., "Validation Error", "Conflict"
    private String message;   // summary message
    private String path;      // request URI
    private List<ApiFieldError> errors; // optional detailed validation list

    public ApiError() {}

    public ApiError(String error, String message, String path) {
        this.error = error;
        this.message = message;
        this.path = path;
    }

    public ApiError(String error, String message, String path, List<ApiFieldError> errors) {
        this.error = error;
        this.message = message;
        this.path = path;
        this.errors = errors;
    }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public List<ApiFieldError> getErrors() { return errors; }
    public void setErrors(List<ApiFieldError> errors) { this.errors = errors; }
}
