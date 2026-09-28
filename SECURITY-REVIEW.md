# Security Review: Public LMS Course Search

### 1. API Understanding

| Item | Finding |
| --- | --- |
| Purpose | Return courses whose names contain the supplied search keyword. |
| Input | Required `keyword` query parameter; no validation is shown. |
| Data accessed | Rows from the `courses` table, mapped to `Course`. |
| Expected users | All users, including unauthenticated visitors, per the stated purpose. |
| Expected permissions | Read-only access to course-search results; no user-specific resource is identified. |

### 2. Security Review

| Security Area | Status | Finding | Risk Explanation | Recommended Fix |
| --- | --- | --- | --- | --- |
| Authentication | PASS | No authentication is required, consistent with the stated public endpoint. | Public access is not itself a vulnerability here. | Keep public only if course search and returned fields are intended for everyone. |
| Authorization | PASS | No role check is shown; the endpoint is intentionally available to all users. | No restricted functionality is evident in the snippet. | Reassess if courses or fields have visibility restrictions. |
| Object-Level Authorization | NOT APPLICABLE | The query searches shared course records, not a specific user's or owner's resource. | No per-user object identifier or ownership relationship is shown. | Reassess if the endpoint later returns user-specific or restricted course data. |
| Input Validation | NEEDS REVIEW | No length, blank-value, or input policy is enforced. `@RequestParam` is required by default, but an empty value can still match every course. | Excessive input may waste resources; empty searches may return a broad result set. | Reject blank input if undesired; set a reasonable maximum length and define wildcard behavior. |
| SQL Injection | FAIL | `keyword` is concatenated into the SQL statement. | A caller can alter the SQL predicate and potentially retrieve more course rows than intended. | Bind the pattern as a parameter using `JdbcTemplate`. |
| Sensitive Data Exposure | NEEDS REVIEW | `SELECT *` and the `Course` response type may include fields beyond those needed for public search. The fields and mapper are not provided. | If internal or sensitive columns are mapped and serialized, they could be disclosed to all callers. | Select only public columns and return a purpose-built response DTO/projection. |
| Error Handling | NEEDS REVIEW | No exception handling is shown. | The framework may return an error response; whether it exposes SQL, stack traces, or database details depends on application configuration. | Return a generic client error; log diagnostic details server-side without exposing SQL or sensitive input. |
| Business Logic | NEEDS REVIEW | No pagination, result cap, rate limit, or query-cost control is shown. `%` and `_` in `LIKE` remain wildcard characters even after parameterization. | Broad or repeated searches may consume database resources; wildcard searches may match many courses. | Add pagination/result limits and appropriate rate limiting; escape wildcards if literal substring matching is intended. |
| Least Privilege | NEEDS REVIEW | Database permissions are not shown. | A read-only endpoint should not use a database account capable of modifying data. | Use a database principal with only the required read permissions. |
| Defense in Depth | FAIL | The SQL uses no parameter binding; other compensating controls are not shown. | Validation alone cannot reliably prevent SQL injection. | Parameterize SQL and combine it with validation, least-privilege DB access, and bounded results. |
| Fail Securely | NEEDS REVIEW | Failure behavior is not shown. | Detailed database errors could expose implementation information if returned to callers. | Use generic API errors and ensure failed queries do not produce partial or misleading success responses. |
| Secure Defaults | NEEDS REVIEW | No explicit search-size/result bounds are shown. | Unbounded search behavior can become the default behavior. | Set safe maximum input length and result size; require explicit policy for empty searches. |
| Secure Logging | NEEDS REVIEW | Logging behavior is not shown. | Logging full keywords or SQL can expose user-provided data and internal query details. | Log useful, sanitized metadata; avoid logging secrets, full SQL, or unnecessarily complete search terms. |
| Secrets/Credentials | PASS | Not found in provided snippet. | No credentials, keys, or tokens are present in the shown code. This does not assess the rest of the application. | No change indicated for this snippet. |

### 3. Data Flow Analysis

| Stage | Existing control | Attack surface / missing control | Recommended improvement |
| --- | --- | --- | --- |
| HTTP request | `GET` endpoint; intended to be public. | Public callers can submit arbitrary query values; no rate limit is shown. | Keep public by design; apply suitable request throttling. |
| Controller | `@GetMapping` routes to the search method. | Authentication/authorization are absent, intentionally; validation is absent. | Validate required search policy and maximum length. |
| Request parameter | Spring binds `keyword`; required by default. | Empty and very long values are not explicitly rejected. | Reject blank or oversized values as appropriate. |
| SQL construction | None for safe binding. | String concatenation permits SQL injection; LIKE wildcard semantics broaden matches. | Bind a query parameter; escape wildcard characters if literal matching is intended. |
| Database | Reads from `courses`. | Database permissions, indexes, query limits, and resource controls are unknown. | Use least-privilege read access, indexed search where appropriate, and bounded queries. |
| `CourseRowMapper` | Maps database rows to `Course`. | Mapper fields are not shown; mapping may include unnecessary data. | Map only public search-result fields. |
| API response | Returns a list of `Course`. | Entity serialization may expose fields; response size is not bounded here. | Return a DTO and paginate or cap results. |

### 4. Confirmed Security Issues

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | 🟠 HIGH | Provided snippet | SQL construction | SQL injection through concatenated `keyword` (CWE-89; OWASP A03:2021 Injection) | 9/10 |

* **Evidence:** `keyword` is inserted into `"SELECT * FROM courses WHERE name LIKE '%" + keyword + "%'"` and executed as SQL.
* **LMS impact:** A user can change the search predicate, potentially making the public endpoint return unrelated course rows. The snippet shows a read query; further impact depends on database and application configuration.
* **Safe demonstration:** Supplying the text `%' OR '1'='1' -- ` produces `SELECT * FROM courses WHERE name LIKE '%%' OR '1'='1' -- %'`. On databases where `-- ` starts a comment, the predicate can match all rows. This is a non-destructive example; its exact behavior depends on the database's SQL dialect.
* **Recommended fix:** Use a prepared/parameterized query. Do not rely on input validation or escaping as a substitute for binding.

### 5. Secure Version of the Code

```java
@GetMapping("/courses/search")
public List<Course> searchCourses(@RequestParam String keyword) {
    if (keyword.isBlank() || keyword.length() > 100) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Keyword must contain 1 to 100 characters");
    }

    String sql = "SELECT id, name, description FROM courses WHERE name LIKE ?";
    String pattern = "%" + keyword + "%";

    return jdbcTemplate.query(
            sql,
            ps -> ps.setString(1, pattern),
            new CourseRowMapper()
    );
}
```

This example assumes `id`, `name`, and `description` are approved public fields; align the selected columns and mapper with the actual schema. Add pagination or a result cap for production. If `%` and `_` should be treated literally, escape them according to the database's `LIKE ... ESCAPE` syntax.

### 6. Final Checklist

| Check | Result |
| --- | --- |
| Endpoint purpose and intended public use understood | PASS |
| Authentication treated as intentionally public | PASS |
| Role authorization required by shown behavior | NOT APPLICABLE |
| Object-level authorization required by shown query | NOT APPLICABLE |
| SQL injection prevented in original code | FAIL |
| Input validation and query bounds demonstrated in original code | FAIL |
| Sensitive fields in `Course` response assessed | NEEDS REVIEW |
| Error exposure assessed from shown code | NEEDS REVIEW |
| Hardcoded secrets in provided snippet | PASS |
| Safe parameterized implementation provided | PASS |
