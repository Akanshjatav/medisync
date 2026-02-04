package com.tcs.ilp.pharmacy.medisync.exception;

public class InvalidBidException extends RuntimeException {
    private final String errorCode = "INVALID_BID";

    public InvalidBidException(String message) {
        super(message);
    }

    public String getErrorCode() {
        return errorCode;
    }
}
