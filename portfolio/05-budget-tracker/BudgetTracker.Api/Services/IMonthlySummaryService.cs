using BudgetTracker.Api.Models;

namespace BudgetTracker.Api.Services;

public interface IMonthlySummaryService
{
    /// <summary>
    /// Computes total income, total expenses and net for the given year/month
    /// from an arbitrary set of transactions.
    /// </summary>
    MonthlySummaryDto Summarize(IEnumerable<Transaction> transactions, int year, int month);

    /// <summary>
    /// Loads transactions for the given year/month from the database and computes the summary.
    /// </summary>
    Task<MonthlySummaryDto> GetMonthlySummaryAsync(int year, int month);
}
