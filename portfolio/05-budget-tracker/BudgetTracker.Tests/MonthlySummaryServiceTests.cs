using BudgetTracker.Api.Data;
using BudgetTracker.Api.Models;
using BudgetTracker.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BudgetTracker.Tests;

public class MonthlySummaryServiceTests
{
    private static BudgetContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<BudgetContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        return new BudgetContext(options);
    }

    [Fact]
    public void Summarize_WithMixedIncomeAndExpenses_ComputesCorrectTotals()
    {
        // Arrange
        using var context = CreateContext(nameof(Summarize_WithMixedIncomeAndExpenses_ComputesCorrectTotals));
        var service = new MonthlySummaryService(context);

        var transactions = new List<Transaction>
        {
            new() { Id = 1, Description = "Salary", Amount = 3000m, Date = new DateTime(2026, 7, 1), Type = TransactionType.Income, CategoryId = 1 },
            new() { Id = 2, Description = "Freelance", Amount = 500m, Date = new DateTime(2026, 7, 15), Type = TransactionType.Income, CategoryId = 1 },
            new() { Id = 3, Description = "Rent", Amount = 1200m, Date = new DateTime(2026, 7, 3), Type = TransactionType.Expense, CategoryId = 2 },
            new() { Id = 4, Description = "Groceries", Amount = 250.50m, Date = new DateTime(2026, 7, 20), Type = TransactionType.Expense, CategoryId = 2 },
        };

        // Act
        var summary = service.Summarize(transactions, 2026, 7);

        // Assert
        Assert.Equal(2026, summary.Year);
        Assert.Equal(7, summary.Month);
        Assert.Equal(3500m, summary.TotalIncome);
        Assert.Equal(1450.50m, summary.TotalExpenses);
        Assert.Equal(2049.50m, summary.Net);
        Assert.Equal(4, summary.TransactionCount);
    }

    [Fact]
    public void Summarize_IgnoresTransactionsOutsideRequestedMonth()
    {
        using var context = CreateContext(nameof(Summarize_IgnoresTransactionsOutsideRequestedMonth));
        var service = new MonthlySummaryService(context);

        var transactions = new List<Transaction>
        {
            new() { Id = 1, Description = "June salary", Amount = 1000m, Date = new DateTime(2026, 6, 30), Type = TransactionType.Income, CategoryId = 1 },
            new() { Id = 2, Description = "July salary", Amount = 2000m, Date = new DateTime(2026, 7, 1), Type = TransactionType.Income, CategoryId = 1 },
            new() { Id = 3, Description = "August rent", Amount = 900m, Date = new DateTime(2026, 8, 1), Type = TransactionType.Expense, CategoryId = 2 },
        };

        var summary = service.Summarize(transactions, 2026, 7);

        Assert.Equal(2000m, summary.TotalIncome);
        Assert.Equal(0m, summary.TotalExpenses);
        Assert.Equal(2000m, summary.Net);
        Assert.Equal(1, summary.TransactionCount);
    }

    [Fact]
    public void Summarize_WithNoTransactionsInMonth_ReturnsZeroes()
    {
        using var context = CreateContext(nameof(Summarize_WithNoTransactionsInMonth_ReturnsZeroes));
        var service = new MonthlySummaryService(context);

        var summary = service.Summarize(new List<Transaction>(), 2026, 7);

        Assert.Equal(0m, summary.TotalIncome);
        Assert.Equal(0m, summary.TotalExpenses);
        Assert.Equal(0m, summary.Net);
        Assert.Equal(0, summary.TransactionCount);
    }

    [Fact]
    public async Task GetMonthlySummaryAsync_ReadsFromDatabase_ComputesCorrectTotals()
    {
        using var context = CreateContext(nameof(GetMonthlySummaryAsync_ReadsFromDatabase_ComputesCorrectTotals));

        context.Categories.Add(new Category { Id = 1, Name = "Salary", Type = TransactionType.Income });
        context.Categories.Add(new Category { Id = 2, Name = "Bills", Type = TransactionType.Expense });
        context.Transactions.AddRange(
            new Transaction { Description = "Paycheck", Amount = 4000m, Date = new DateTime(2026, 7, 5), Type = TransactionType.Income, CategoryId = 1 },
            new Transaction { Description = "Electricity", Amount = 120m, Date = new DateTime(2026, 7, 10), Type = TransactionType.Expense, CategoryId = 2 }
        );
        await context.SaveChangesAsync();

        var service = new MonthlySummaryService(context);
        var summary = await service.GetMonthlySummaryAsync(2026, 7);

        Assert.Equal(4000m, summary.TotalIncome);
        Assert.Equal(120m, summary.TotalExpenses);
        Assert.Equal(3880m, summary.Net);
        Assert.Equal(2, summary.TransactionCount);
    }
}
