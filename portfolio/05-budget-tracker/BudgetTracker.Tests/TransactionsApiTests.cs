using System.Net;
using System.Net.Http.Json;
using BudgetTracker.Api.Models;
using Xunit;

namespace BudgetTracker.Tests;

public class TransactionsApiTests : IClassFixture<TransactionsApiFactory>
{
    private readonly TransactionsApiFactory _factory;

    public TransactionsApiTests(TransactionsApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<int> CreateCategoryAsync(HttpClient client, string name, TransactionType type)
    {
        var response = await client.PostAsJsonAsync("/api/categories", new CategoryCreateDto
        {
            Name = name,
            Type = type
        });
        response.EnsureSuccessStatusCode();
        var category = await response.Content.ReadFromJsonAsync<Category>();
        return category!.Id;
    }

    [Fact]
    public async Task CreateThenGetTransaction_ReturnsTheSameTransaction()
    {
        var client = _factory.CreateClient();
        var categoryId = await CreateCategoryAsync(client, "Salary-" + Guid.NewGuid(), TransactionType.Income);

        var createDto = new TransactionCreateDto
        {
            Description = "July paycheck",
            Amount = 2500.75m,
            Date = new DateTime(2026, 7, 1),
            Type = TransactionType.Income,
            CategoryId = categoryId
        };

        var createResponse = await client.PostAsJsonAsync("/api/transactions", createDto);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var created = await createResponse.Content.ReadFromJsonAsync<Transaction>();
        Assert.NotNull(created);
        Assert.True(created!.Id > 0);

        var getResponse = await client.GetAsync($"/api/transactions/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var fetched = await getResponse.Content.ReadFromJsonAsync<Transaction>();
        Assert.NotNull(fetched);
        Assert.Equal("July paycheck", fetched!.Description);
        Assert.Equal(2500.75m, fetched.Amount);
        Assert.Equal(TransactionType.Income, fetched.Type);
    }

    [Fact]
    public async Task GetTransaction_WithUnknownId_ReturnsNotFound()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/transactions/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateTransaction_WithInvalidAmount_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var categoryId = await CreateCategoryAsync(client, "Misc-" + Guid.NewGuid(), TransactionType.Expense);

        var invalidDto = new TransactionCreateDto
        {
            Description = "Bad expense",
            Amount = -10m, // invalid: must be > 0
            Date = DateTime.UtcNow,
            Type = TransactionType.Expense,
            CategoryId = categoryId
        };

        var response = await client.PostAsJsonAsync("/api/transactions", invalidDto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateTransaction_WithMissingDescription_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var categoryId = await CreateCategoryAsync(client, "Misc2-" + Guid.NewGuid(), TransactionType.Expense);

        var invalidDto = new TransactionCreateDto
        {
            Description = "",
            Amount = 25m,
            Date = DateTime.UtcNow,
            Type = TransactionType.Expense,
            CategoryId = categoryId
        };

        var response = await client.PostAsJsonAsync("/api/transactions", invalidDto);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task MonthlySummary_ReflectsCreatedTransactions()
    {
        var client = _factory.CreateClient();
        var incomeCategoryId = await CreateCategoryAsync(client, "Salary2-" + Guid.NewGuid(), TransactionType.Income);
        var expenseCategoryId = await CreateCategoryAsync(client, "Rent2-" + Guid.NewGuid(), TransactionType.Expense);

        // Use a distinctive year to avoid collisions with other tests running against the shared fixture.
        const int year = 2031;
        const int month = 3;

        await client.PostAsJsonAsync("/api/transactions", new TransactionCreateDto
        {
            Description = "Salary",
            Amount = 5000m,
            Date = new DateTime(year, month, 1),
            Type = TransactionType.Income,
            CategoryId = incomeCategoryId
        });

        await client.PostAsJsonAsync("/api/transactions", new TransactionCreateDto
        {
            Description = "Rent",
            Amount = 1500m,
            Date = new DateTime(year, month, 5),
            Type = TransactionType.Expense,
            CategoryId = expenseCategoryId
        });

        var response = await client.GetAsync($"/api/transactions/summary/{year}/{month}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var summary = await response.Content.ReadFromJsonAsync<MonthlySummaryDto>();
        Assert.NotNull(summary);
        Assert.Equal(5000m, summary!.TotalIncome);
        Assert.Equal(1500m, summary.TotalExpenses);
        Assert.Equal(3500m, summary.Net);
    }
}
