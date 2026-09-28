# Team 2 - LMS Online Quiz & Assessment Module

Spring Boot backend for the Team 2 Online Quiz & Assessment module.

## Stack

- Java 21
- Spring Boot 3.5.6
- Spring Web
- Spring Data JPA / Hibernate
- Spring Security
- JWT authentication
- BCrypt password hashing
- MySQL
- Bean Validation
- Swagger / OpenAPI
- Lombok
- Maven

## Prerequisites

- JDK 21
- Maven 3.9+
- MySQL 8.x

## Database

The application creates the database automatically if the MySQL user has permission.

Default configuration in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lms_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

Change the username/password if your MySQL setup is different.

## Run

```bash
mvn clean spring-boot:run
```

Or:

```bash
mvn clean package
java -jar target/lms-quiz-assessment-0.0.1-SNAPSHOT.jar
```

## Swagger

Open:

`http://localhost:8080/swagger-ui.html`

OpenAPI JSON:

`http://localhost:8080/v3/api-docs`

## Authentication

### Register

`POST /api/auth/register`

Example:

```json
{
  "username": "instructor1",
  "password": "password123",
  "role": "INSTRUCTOR"
}
```

Register a student similarly:

```json
{
  "username": "student1",
  "password": "password123",
  "role": "STUDENT"
}
```

### Login

`POST /api/auth/login`

```json
{
  "username": "instructor1",
  "password": "password123"
}
```

Copy the JWT token from the response and use Swagger's **Authorize** button with:

`Bearer <token>`

## Main API flow

1. Register instructor.
2. Login as instructor.
3. Create a course.
4. Create a quiz for the course.
5. Add MCQ questions/options.
6. Register/login as student.
7. Student starts the quiz.
8. Student submits answers.
9. System calculates and stores the result.
10. Student retrieves the result.

## Important MVP note

This starter implements the core Quiz & Assessment module. Course enrollment is represented by the common LMS context but is not yet implemented as a separate enrollment entity. Add the shared team's enrollment/authentication module and connect its enrollment check before allowing quiz attempts.

## Suggested next improvements

- Add Enrollment entity and service.
- Add instructor ownership checks for quiz updates.
- Add PUT/DELETE quiz/question APIs.
- Add pagination.
- Add DTOs for question responses to avoid exposing JPA entities.
- Add automated unit/integration tests.
- Add database migrations with Flyway.
- Add CI using GitHub/Bitbucket pipelines.
