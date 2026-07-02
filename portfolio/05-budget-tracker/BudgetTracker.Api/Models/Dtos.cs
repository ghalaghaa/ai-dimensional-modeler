using System.ComponentModel.DataAnnotations;

namespace BudgetTracker.Api.Models;

public class CategoryCreateDto
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public TransactionType Type { get; set; }
}

public class CategoryUpdateDto : CategoryCreateDto
{
}

public class TransactionCreateDto
{
    [Required(ErrorMessage = "Description is required.")]
    [StringLength(200, MinimumLength = 1)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public TransactionType Type { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "CategoryId must reference an existing category.")]
    public int CategoryId { get; set; }
}

public class TransactionUpdateDto : TransactionCreateDto
{
}

/// <summary>
/// Result of a monthly income/expense roll-up.
/// </summary>
public class MonthlySummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal Net { get; set; }
    public int TransactionCount { get; set; }
}
