
package com.tcs.ilp.pharmacy.medisync.exception;

public class InvalidBatchReferenceException extends RuntimeException {
    public InvalidBatchReferenceException(String message) {
        super(message);
    }

    public InvalidBatchReferenceException(String message, Throwable cause) {
        super(message, cause);
    }
}
