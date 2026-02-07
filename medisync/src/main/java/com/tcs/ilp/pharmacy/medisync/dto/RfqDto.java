package com.tcs.ilp.pharmacy.medisync.dto;

import java.time.LocalDateTime;

public class RfqDto {
    private Integer rfqId;
    private Integer createdBy;
    private String statusAward;
    private LocalDateTime submissionDeadline;
    private LocalDateTime expectedDeliveryDate;

    public Integer getRfqId() { return rfqId; }
    public void setRfqId(Integer rfqId) { this.rfqId = rfqId; }

    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }

    public String getStatusAward() { return statusAward; }
    public void setStatusAward(String statusAward) { this.statusAward = statusAward; }

    public LocalDateTime getSubmissionDeadline() { return submissionDeadline; }
    public void setSubmissionDeadline(LocalDateTime submissionDeadline) { this.submissionDeadline = submissionDeadline; }

    public LocalDateTime getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDateTime expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
}