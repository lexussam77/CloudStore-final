package com.cloudstore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String to, String code) {
        String subject = "Verify your CloudStore email";
        String text = "Your CloudStore verification code is: " + code + "\n\nThis code will expire in 10 minutes.";
        sendEmail(to, subject, text);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "CloudStore Password Reset";
        String resetUrl = "http://localhost:8080/api/auth/reset-password?token=" + token;
        String text = "Click the link to reset your password: " + resetUrl;
        sendEmail(to, subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error to the console
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
} 