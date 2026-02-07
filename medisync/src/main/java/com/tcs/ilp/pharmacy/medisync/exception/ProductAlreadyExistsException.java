
package com.tcs.ilp.pharmacy.medisync.exception;

public class ProductAlreadyExistsException extends RuntimeException {
    public ProductAlreadyExistsException(String message) {
        super(message);
    }
    public ProductAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}

