namespace BudgetTracker.Api.Models;

/// <summary>
/// Whether a category or transaction represents money coming in or going out.
/// </summary>
public enum TransactionType
{
    Income = 0,
    Expense = 1
}
