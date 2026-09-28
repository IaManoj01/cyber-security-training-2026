package com.team2.lms.controller;

import com.team2.lms.entity.Course;
import com.team2.lms.repository.CourseRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseRepository courses;
    public CourseController(CourseRepository courses) { this.courses = courses; }

    record CourseRequest(@NotBlank String title, String description) {}

    @GetMapping
    public List<Course> all() { return courses.findAll(); }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
    public ResponseEntity<Course> create(@Valid @RequestBody CourseRequest request) {
        Course c = courses.save(Course.builder().title(request.title()).description(request.description()).build());
        return ResponseEntity.status(HttpStatus.CREATED).body(c);
    }
}
