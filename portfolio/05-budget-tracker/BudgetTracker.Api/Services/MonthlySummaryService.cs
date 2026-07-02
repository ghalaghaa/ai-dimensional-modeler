using BudgetTracker.Api.Data;
using BudgetTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Api.Services;

/// <summary>
/// Computes monthly income/expense/net summaries. Kept independent of EF Core query
/// specifics in the pure calculation method so it can be unit tested with plain
/// in-memory objects, while <see cref="GetMonthlySummaryAsync"/> wires it up to the
/// real database for the API.
/// </summary>
public class MonthlySummaryService : IMonthlySummaryService
{
    private readonly BudgetContext _context;

    public MonthlySummaryService(BudgetContext context)
    {
        _context = context;
    }

    public MonthlySummaryDto Summarize(IEnumerable<Transaction> transactions, int year, int month)
    {
        var relevant = transactions
            .Where(t => t.Date.Year == year && t.Date.Month == month)
            .ToList();

        var totalIncome = relevant
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);

        var totalExpenses = relevant
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        return new MonthlySummaryDto
        {
            Year = year,
            Month = month,
            TotalIncome = totalIncome,
            TotalExpenses = totalExpenses,
            Net = totalIncome - totalExpenses,
            TransactionCount = relevant.Count
        };
    }

    public async Task<MonthlySummaryDto> GetMonthlySummaryAsync(int year, int month)
    {
        var transactions = await _context.Transactions
            .Where(t => t.Date.Year == year && t.Date.Month == month)
            .ToListAsync();

        return Summarize(transactions, year, month);
    }
}
