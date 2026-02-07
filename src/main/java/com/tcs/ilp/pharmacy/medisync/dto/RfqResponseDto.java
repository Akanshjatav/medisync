package com.tcs.ilp.pharmacy.medisync.dto;

import java.time.LocalDateTime;
import java.util.List;

public class RfqResponseDto {

    private Integer rfqId;
    private String createdByUsername;
    private String statusAward;
    private LocalDateTime submissionDeadline;
    private LocalDateTime expectedDeliveryDate;
    private List<RfqItemResponseDto> items;

    public Integer getRfqId() {
        return rfqId;
    }

    public void setRfqId(Integer rfqId) {
        this.rfqId = rfqId;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    public String getStatusAward() {
        return statusAward;
    }

    public void setStatusAward(String statusAward) {
        this.statusAward = statusAward;
    }

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

    public List<RfqItemResponseDto> getItems() {
        return items;
    }

    public void setItems(List<RfqItemResponseDto> items) {
        this.items = items;
    }
}
