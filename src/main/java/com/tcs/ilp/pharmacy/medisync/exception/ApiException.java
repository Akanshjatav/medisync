package com.tcs.ilp.pharmacy.medisync.exception;

import org.springframework.http.HttpStatus;

public abstract class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String error;

    protected ApiException(HttpStatus status, String error, String message) {
        super(message);
        this.status = status;
        this.error = error;

    }

    public HttpStatus getStatus() { return status; }
    public String getError() { return error; }
}