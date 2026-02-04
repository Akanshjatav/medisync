
package com.tcs.ilp.pharmacy.medisync.exception;

public class ConflictException extends RuntimeException {
    public ConflictException() { super(); }
    public ConflictException(String message) { super(message); }
    public ConflictException(String message, Throwable cause) { super(message, cause); }
}
