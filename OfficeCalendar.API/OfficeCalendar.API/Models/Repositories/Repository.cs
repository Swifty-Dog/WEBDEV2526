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

    public virtual async Task<T?> GetById(long id)
    {
        var set = Context.Set<T>();
        return await set.FindAsync(id);
    }

    public virtual async Task<List<T>> GetAll() => await DbSet.ToListAsync();

    public virtual async Task<int> Count() => await DbSet.CountAsync();

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
}