using BudgetTracker.Api.Data;
using BudgetTracker.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BudgetTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly BudgetContext _context;

    public CategoriesController(BudgetContext context)
    {
        _context = context;
    }

    // GET: api/categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories.AsNoTracking().ToListAsync();
    }

    // GET: api/categories/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _context.Categories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);

        if (category is null)
        {
            return NotFound();
        }

        return category;
    }

    // POST: api/categories
    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(CategoryCreateDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Type = dto.Type
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    // PUT: api/categories/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, CategoryUpdateDto dto)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category is null)
        {
            return NotFound();
        }

        category.Name = dto.Name;
        category.Type = dto.Type;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/categories/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category is null)
        {
            return NotFound();
        }

        var hasTransactions = await _context.Transactions.AnyAsync(t => t.CategoryId == id);
        if (hasTransactions)
        {
            return Conflict(new { message = "Cannot delete a category that still has transactions." });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
