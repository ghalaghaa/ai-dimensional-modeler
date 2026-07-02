using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BudgetTracker.Api.Models;

/// <summary>
/// A single income or expense entry.
/// </summary>
public class Transaction
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(200, MinimumLength = 1)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public TransactionType Type { get; set; }

    public int CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category? Category { get; set; }
}
