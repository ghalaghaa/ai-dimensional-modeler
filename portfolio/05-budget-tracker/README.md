# Budget Tracker API

A small REST API for personal budgeting: track income and expenses by category
and get a monthly summary of what came in, what went out, and the net result.

**Who it's for:** everyday people who want a simple, self-hostable backend for
tracking their money — the kind of thing behind a budgeting app or a personal
finance dashboard, without the complexity of a full accounting system.

## Tech stack

- **C# / ASP.NET Core 8** — controller-based Web API
- **Entity Framework Core 8** with the **SQLite** provider — a real on-disk
  database (`budgettracker.db`), not in-memory lists
- **xUnit** — unit and integration tests
- **Microsoft.AspNetCore.Mvc.Testing** (`WebApplicationFactory<Program>`) —
  integration tests against the real HTTP pipeline

## Project structure

```
05-budget-tracker/
├── BudgetTracker.sln
├── BudgetTracker.Api/          # the Web API
│   ├── Controllers/            # CategoriesController, TransactionsController
│   ├── Data/                   # BudgetContext (EF Core DbContext)
│   ├── Models/                 # Category, Transaction, DTOs, enums
│   ├── Services/                # MonthlySummaryService (business logic)
│   └── Program.cs
└── BudgetTracker.Tests/        # xUnit test project
    ├── MonthlySummaryServiceTests.cs   # unit tests
    ├── TransactionsApiTests.cs         # integration tests
    └── TransactionsApiFactory.cs       # WebApplicationFactory setup
```

## Domain model

- **Category**: `Id`, `Name`, `Type` (`Income` / `Expense`)
- **Transaction**: `Id`, `Description`, `Amount`, `Date`, `CategoryId`, `Type`
  (`Income` / `Expense`)

Both have full CRUD endpoints under `/api/categories` and `/api/transactions`,
with data-annotation validation (e.g. `Amount` must be greater than 0,
`Description`/`Name` are required) returning `400 Bad Request` on invalid
input and `404 Not Found` for unknown ids.

The one piece of real business logic is the monthly summary:

```
GET /api/transactions/summary/{year}/{month}
```

which totals income, totals expenses, and computes the net for that month.
The calculation lives in `Services/MonthlySummaryService.cs`, completely
separate from the controller, so it can be unit tested in isolation.

## How to run

From the `BudgetTracker.Api` project directory:

```bash
cd BudgetTracker.Api
dotnet run
```

The API listens on the URL printed in the console (e.g.
`http://localhost:5299`) and applies the SQLite schema automatically on
startup (`Database.EnsureCreated()`), creating `budgettracker.db` alongside
the project. Swagger UI is available at `/swagger` in the Development
environment.

## How to run tests

From the repository root (`05-budget-tracker/`, where `BudgetTracker.sln`
lives):

```bash
dotnet test
```

This runs both:
- **Unit tests** for `MonthlySummaryService` (mixed income/expense
  transactions, transactions outside the requested month, empty months).
- **Integration tests** that boot the real API in-process with
  `WebApplicationFactory<Program>` against an isolated SQLite database,
  covering: create → fetch a transaction, `404` for an unknown id, `400` for
  validation failures (negative amount, missing description), and the
  monthly summary endpoint end to end.

## Example usage

Create an income category, then an expense category:

```bash
curl -X POST http://localhost:5299/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Salary","type":0}'

curl -X POST http://localhost:5299/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Groceries","type":1}'
```

Add an income transaction (`type: 0` = Income) and an expense (`type: 1` =
Expense), referencing the category ids returned above:

```bash
curl -X POST http://localhost:5299/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"description":"July paycheck","amount":4200.00,"date":"2026-07-01","type":0,"categoryId":1}'

curl -X POST http://localhost:5299/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"description":"Weekly groceries","amount":135.40,"date":"2026-07-05","type":1,"categoryId":2}'
```

Get the monthly summary for July 2026:

```bash
curl http://localhost:5299/api/transactions/summary/2026/7
# {"year":2026,"month":7,"totalIncome":4200.0,"totalExpenses":135.4,"net":4064.6,"transactionCount":2}
```
