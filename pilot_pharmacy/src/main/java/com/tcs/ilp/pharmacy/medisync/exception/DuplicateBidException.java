package com.tcs.ilp.pharmacy.medisync.exception;
public class DuplicateBidException extends RuntimeException {
    private final String errorCode = "DUPLICATE_BID";

    public DuplicateBidException(int vendorId, int rfqId) {
        super("Vendor " + vendorId + " already has a bid for RFQ " + rfqId + ".");
    }
    public String getErrorCode() {
        return errorCode;
    }
}

