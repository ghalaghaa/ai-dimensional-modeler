# Clinic Manager API

A small REST API for managing patients, appointments, and pharmacy/supply inventory in a
single-location clinic or small pharmacy. It's built for small healthcare businesses that need
a lightweight system of record — patient contacts, scheduled visits, and stock levels — without
paying for a full practice-management suite. The API tracks patients, books and updates
appointments, and flags inventory items that have dropped to or below their reorder threshold so
staff know what to restock.

## Tech stack

- Java 21
- Spring Boot 3.3 (Spring Web, Spring Data JPA, Bean Validation)
- H2 in-memory database (no external DB setup required)
- JUnit 5, Mockito, MockMvc for testing
- Maven

## Project layout

```
src/main/java/com/clinicmanager
├── ClinicManagerApplication.java
├── controller/       REST controllers (Patient, Appointment, InventoryItem)
├── service/          business logic, one service per aggregate
├── repository/       Spring Data JPA repositories
├── entity/           JPA entities (Patient, Appointment, AppointmentStatus, InventoryItem)
├── dto/              request/response DTOs with bean validation
└── exception/        ResourceNotFoundException + global @RestControllerAdvice
```

## How to run

```bash
mvn spring-boot:run
```

The API starts on `http://localhost:8080`. Data is stored in an in-memory H2 database that
resets every time the app restarts. The H2 console is available at `/h2-console`
(JDBC URL: `jdbc:h2:mem:clinicdb`, user `sa`, empty password).

## How to run tests

```bash
mvn test
```

This runs:
- `@SpringBootTest` + `MockMvc` integration tests for the Patient, Appointment, and
  InventoryItem controllers — covering create, get-by-id, list, the 404-not-found case, and
  bean-validation failures (400).
- A plain JUnit + Mockito unit test for the low-stock business logic in `InventoryItemService`.

## Example usage

Create a patient:

```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Maria Gonzalez","phone":"555-2020","dateOfBirth":"1988-04-12"}'
# => {"id":1,"fullName":"Maria Gonzalez","phone":"555-2020","dateOfBirth":"1988-04-12"}
```

Book an appointment for that patient:

```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"patientId":1,"dateTime":"2026-07-10T09:30:00","reason":"Annual physical"}'
# => {"id":1,"patientId":1,"patientName":"Maria Gonzalez","dateTime":"2026-07-10T09:30:00","reason":"Annual physical","status":"SCHEDULED"}
```

Add an inventory item and check what's running low:

```bash
curl -X POST http://localhost:8080/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"name":"Amoxicillin 500mg","quantity":8,"unit":"box","reorderThreshold":15}'

curl http://localhost:8080/api/inventory/low-stock
# => [{"id":1,"name":"Amoxicillin 500mg","quantity":8,"unit":"box","reorderThreshold":15}]
```

## API overview

| Method | Path                        | Description                                    |
|--------|------------------------------|------------------------------------------------|
| POST   | `/api/patients`              | Create a patient                                |
| GET    | `/api/patients`              | List patients                                   |
| GET    | `/api/patients/{id}`         | Get a patient by id (404 if missing)            |
| PUT    | `/api/patients/{id}`         | Update a patient                                |
| DELETE | `/api/patients/{id}`         | Delete a patient                                |
| POST   | `/api/appointments`          | Book an appointment (404 if patient is missing) |
| GET    | `/api/appointments`          | List appointments                               |
| GET    | `/api/appointments/{id}`     | Get an appointment by id                        |
| PUT    | `/api/appointments/{id}`     | Update an appointment (e.g. change status)      |
| DELETE | `/api/appointments/{id}`     | Cancel/delete an appointment                    |
| POST   | `/api/inventory`              | Create an inventory item                       |
| GET    | `/api/inventory`              | List inventory items                            |
| GET    | `/api/inventory/low-stock`    | List items at or below their reorder threshold |
| GET    | `/api/inventory/{id}`         | Get an inventory item by id                     |
| PUT    | `/api/inventory/{id}`         | Update an inventory item                        |
| DELETE | `/api/inventory/{id}`         | Delete an inventory item                        |

Invalid request bodies (e.g. blank `fullName`, negative `quantity`) return `400 Bad Request`
with a `fieldErrors` map. Requests referencing an id that doesn't exist return
`404 Not Found`.
