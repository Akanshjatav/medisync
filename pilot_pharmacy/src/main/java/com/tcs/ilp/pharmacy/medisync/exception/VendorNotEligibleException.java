package com.tcs.ilp.pharmacy.medisync.exception;

public class VendorNotEligibleException extends RuntimeException {
    private final String errorCode = "VENDOR_NOT_ELIGIBLE";

    public VendorNotEligibleException(int vendorId, int rfqId) {
        super("Vendor " + vendorId + " is not eligible for RFQ " + rfqId + ".");
    }

    public String getErrorCode() {
        return errorCode;
    }
}
