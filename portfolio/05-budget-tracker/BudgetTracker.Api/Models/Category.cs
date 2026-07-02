using System.ComponentModel.DataAnnotations;

namespace BudgetTracker.Api.Models;

/// <summary>
/// A budgeting category, e.g. "Groceries" (Expense) or "Salary" (Income).
/// </summary>
public class Category
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public TransactionType Type { get; set; }

    public List<Transaction> Transactions { get; set; } = new();
}
