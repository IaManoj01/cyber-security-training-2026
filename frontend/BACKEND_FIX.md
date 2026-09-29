# Required backend fix for MCQ options

The current backend returns `Question` directly:

```java
@GetMapping("/quizzes/{quizId}/questions")
public List<Question> getQuestions(@PathVariable Long quizId) {
    return questions.findByQuizId(quizId);
}
```

But `Question` does not contain an `options` field. The React quiz page needs
the options to render the MCQs.

## Recommended change

Add a relationship to `Question`:

```java
@OneToMany(mappedBy = "question", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
private List<QuestionOption> options;
```

Then initialize it in the entity:

```java
@Builder.Default
@OneToMany(mappedBy = "question", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
private List<QuestionOption> options = new ArrayList<>();
```

Imports:

```java
import java.util.ArrayList;
import java.util.List;
```

However, exposing entities directly is not ideal. A better production solution is
a `QuestionResponse` DTO containing:

- id
- questionText
- marks
- options: [{ id, optionText }]

Do NOT return the `correct` field to students, because that would expose answers.

The frontend expects:

```json
[
  {
    "id": 1,
    "questionText": "Which protocol is used for secure web communication?",
    "marks": 1,
    "options": [
      { "id": 1, "optionText": "HTTPS" },
      { "id": 2, "optionText": "FTP" },
      { "id": 3, "optionText": "Telnet" },
      { "id": 4, "optionText": "SMTP" }
    ]
  }
]
```

## CORS

During local development, the Vite proxy in `vite.config.js` avoids CORS.

For a deployed frontend, configure Spring Security CORS for the actual frontend
domain instead of allowing every origin.
