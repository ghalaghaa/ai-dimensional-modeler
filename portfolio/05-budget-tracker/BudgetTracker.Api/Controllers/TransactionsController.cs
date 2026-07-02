using BudgetTracker.Api.Data;
using BudgetTracker.Api.Models;
using BudgetTracker.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly BudgetContext _context;
    private readonly IMonthlySummaryService _summaryService;

    public TransactionsController(BudgetContext context, IMonthlySummaryService summaryService)
    {
        _context = context;
        _summaryService = summaryService;
    }

    // GET: api/transactions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
    {
        return await _context.Transactions.AsNoTracking().ToListAsync();
    }

    // GET: api/transactions/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Transaction>> GetTransaction(int id)
    {
        var transaction = await _context.Transactions.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);

        if (transaction is null)
        {
            return NotFound();
        }

        return transaction;
    }

    // GET: api/transactions/summary/2026/7
    [HttpGet("summary/{year:int}/{month:int}")]
    public async Task<ActionResult<MonthlySummaryDto>> GetMonthlySummary(int year, int month)
    {
        if (month is < 1 or > 12)
        {
            return BadRequest(new { message = "Month must be between 1 and 12." });
        }

        var summary = await _summaryService.GetMonthlySummaryAsync(year, month);
        return summary;
    }

    // POST: api/transactions
    [HttpPost]
    public async Task<ActionResult<Transaction>> CreateTransaction(TransactionCreateDto dto)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
        {
            ModelState.AddModelError(nameof(dto.CategoryId), "Category does not exist.");
            return ValidationProblem(ModelState);
        }

        var transaction = new Transaction
        {
            Description = dto.Description,
            Amount = dto.Amount,
            Date = dto.Date,
            Type = dto.Type,
            CategoryId = dto.CategoryId
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
    }

    // PUT: api/transactions/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTransaction(int id, TransactionUpdateDto dto)
    {
        var transaction = await _context.Transactions.FindAsync(id);

        if (transaction is null)
        {
            return NotFound();
        }

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
        {
            ModelState.AddModelError(nameof(dto.CategoryId), "Category does not exist.");
            return ValidationProblem(ModelState);
        }

        transaction.Description = dto.Description;
        transaction.Amount = dto.Amount;
        transaction.Date = dto.Date;
        transaction.Type = dto.Type;
        transaction.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/transactions/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var transaction = await _context.Transactions.FindAsync(id);

        if (transaction is null)
        {
            return NotFound();
        }

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
