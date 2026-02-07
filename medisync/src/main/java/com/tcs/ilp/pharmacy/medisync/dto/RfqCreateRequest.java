package com.tcs.ilp.pharmacy.medisync.dto;

import java.time.LocalDateTime;
import java.util.List;

public class RfqCreateRequest {

    private LocalDateTime submissionDeadline;
    private LocalDateTime expectedDeliveryDate;
    private List<RfqItemCreateRequest> items;

    public LocalDateTime getSubmissionDeadline() {
        return submissionDeadline;
    }

    public void setSubmissionDeadline(LocalDateTime submissionDeadline) {
        this.submissionDeadline = submissionDeadline;
    }

    public LocalDateTime getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDateTime expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

    public List<RfqItemCreateRequest> getItems() {
        return items;
    }

    public void setItems(List<RfqItemCreateRequest> items) {
        this.items = items;
    }
}
