using BudgetTracker.Api.Data;
using BudgetTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("BudgetTracker")
    ?? "Data Source=budgettracker.db";

builder.Services.AddDbContext<BudgetContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddScoped<IMonthlySummaryService, MonthlySummaryService>();

var app = builder.Build();

// Ensure the SQLite database and schema exist on startup.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BudgetContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

// Exposed for WebApplicationFactory<Program> in the integration test project.
public partial class Program
{
}
