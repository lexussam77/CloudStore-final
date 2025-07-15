package com.cloudstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class CloudstoreBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(CloudstoreBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner makePathNullable(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE files ALTER COLUMN path DROP NOT NULL;");
            } catch (Exception e) {
                // Ignore if already nullable or error
            }
        };
    }
} 