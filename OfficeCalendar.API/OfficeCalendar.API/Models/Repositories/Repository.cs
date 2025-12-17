using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using OfficeCalendar.API.Models.DbContext;
using OfficeCalendar.API.Models.Repositories.Interfaces;

namespace OfficeCalendar.API.Models.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext Context;
    protected readonly DbSet<T> DbSet;

    public Repository(AppDbContext context)
    {
        Context = context;
        DbSet = Context.Set<T>();
    }

    public virtual async Task<bool> Create(T entity)
    {
        await DbSet.AddAsync(entity);
        int entriesWritten = await Context.SaveChangesAsync();
        return entriesWritten > 0;
    }

    public virtual async Task<T?> GetById(object id)
    {
        var set = Context.Set<T>();
        return await set.FindAsync(id);
    }

    public virtual async Task<List<T>> GetBy(Expression<Func<T, bool>> predicate) => await DbSet.Where(predicate).ToListAsync();

    public virtual async Task<T?> GetSingle(Expression<Func<T, bool>> predicate) => await DbSet.FirstOrDefaultAsync(predicate);

    public virtual async Task<List<T>> GetAll() => await DbSet.ToListAsync();

    public virtual async Task<List<T>> GetAllFiltered(Expression<Func<T, bool>> predicate) => await DbSet.Where(predicate).ToListAsync();

    public Task<List<T>> GetPaginated(int pageNumber, int pageSize, Expression<Func<T, bool>> filter)
    {
        return DbSet.Where(filter)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public virtual async Task<int> Count() => await DbSet.CountAsync();

    public virtual async Task<int> CountFiltered(Expression<Func<T, bool>> predicate) => await DbSet.CountAsync(predicate);

    public virtual async Task<bool> Update(T entity)
    {
        DbSet.Update(entity);
        int entriesWritten = await Context.SaveChangesAsync();
        return entriesWritten > 0;
    }

    public virtual async Task<bool> Delete(T entity)
    {
        DbSet.Remove(entity);
        int entriesWritten = await Context.SaveChangesAsync();
        return entriesWritten > 0;
    }

    public async Task<TTransaction> ExecuteInTransaction<TTransaction>(Func<CancellationToken, Task<TTransaction>> func, CancellationToken cancellationToken = default)
    {
        await using var transaction = await Context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var result = await func(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return result;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}