package com.sujal.jobtracker.repository;

import com.sujal.jobtracker.model.JobApplication;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class JobApplicationRepository {
    private final JdbcTemplate jdbc;

    private final RowMapper<JobApplication> mapper = (rs, rowNum) -> {
        Date applied = rs.getDate("applied_date");
        Timestamp created = rs.getTimestamp("created_at");
        return new JobApplication(
                rs.getLong("id"),
                rs.getString("company"),
                rs.getString("role"),
                rs.getString("job_url"),
                rs.getString("status"),
                applied == null ? null : applied.toLocalDate(),
                rs.getString("notes"),
                created == null ? null : created.toLocalDateTime()
        );
    };

    public JobApplicationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<JobApplication> findAll() {
        return jdbc.query("SELECT * FROM job_applications ORDER BY id DESC", mapper);
    }

    public Optional<JobApplication> findById(long id) {
        return jdbc.query("SELECT * FROM job_applications WHERE id = ?", mapper, id)
                .stream().findFirst();
    }

    public JobApplication create(String company, String role, String jobUrl, String status,
                                 java.time.LocalDate appliedDate, String notes) {
        jdbc.update("""
                INSERT INTO job_applications (company, role, job_url, status, applied_date, notes)
                VALUES (?, ?, ?, ?, ?, ?)
                """, company, role, jobUrl, status,
                appliedDate == null ? null : Date.valueOf(appliedDate), notes);
        return jdbc.query("""
                SELECT * FROM job_applications
                WHERE id = (SELECT MAX(id) FROM job_applications)
                """, mapper).get(0);
    }

    public boolean update(long id, String company, String role, String jobUrl, String status,
                          java.time.LocalDate appliedDate, String notes) {
        int changed = jdbc.update("""
                UPDATE job_applications
                SET company = ?, role = ?, job_url = ?, status = ?, applied_date = ?, notes = ?
                WHERE id = ?
                """, company, role, jobUrl, status,
                appliedDate == null ? null : Date.valueOf(appliedDate), notes, id);
        return changed > 0;
    }

    public boolean delete(long id) {
        return jdbc.update("DELETE FROM job_applications WHERE id = ?", id) > 0;
    }
}
