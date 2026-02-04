package com.tcs.ilp.pharmacy.medisync.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications",
       indexes = {
           @Index(name = "idx_notification_to_user", columnList = "to_user_id"),
           @Index(name = "idx_notification_status", columnList = "notification_status")
       })
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by_store_id", nullable = false)
    private Users raisedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user_id", nullable = false)
    private Users toUser;

    // No enums: e.g., "LOW", "MEDIUM", "HIGH", "CRITICAL"
    @Column(nullable = false, length = 20)
    private String severity;

    @Column(length = 150)
    private String title;

    @Lob
    @Column(nullable = false)
    private String message;

    // No enums: e.g., "NEW", "READ", "ARCHIVED"
    @Column(name = "notification_status", nullable = false, length = 20)
    private String notificationStatus;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Notification() {}

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Integer getNotificationId() { return notificationId; }
    public void setNotificationId(Integer notificationId) { this.notificationId = notificationId; }

    public Users getRaisedBy() { return raisedBy; }
    public void setRaisedBy(Users raisedBy) { this.raisedBy = raisedBy; }

    public Users getToUser() { return toUser; }
    public void setToUser(Users toUser) { this.toUser = toUser; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getNotificationStatus() { return notificationStatus; }
    public void setNotificationStatus(String notificationStatus) { this.notificationStatus = notificationStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
