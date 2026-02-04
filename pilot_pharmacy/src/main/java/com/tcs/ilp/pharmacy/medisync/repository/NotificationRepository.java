package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByToUser_UserId(Integer userId);

    List<Notification> findByNotificationStatus(String status);
}
