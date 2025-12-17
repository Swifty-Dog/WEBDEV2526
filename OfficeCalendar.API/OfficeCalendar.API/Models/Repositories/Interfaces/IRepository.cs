using System.Linq.Expressions;

namespace OfficeCalendar.API.Models.Repositories.Interfaces;

public interface IRepository<T> where T : class
{
    Task<bool> Create(T entity);
    Task<T?> GetById(object id);
    Task<List<T>> GetBy(Expression<Func<T, bool>> predicate);
    Task<T?> GetSingle(Expression<Func<T, bool>> predicate);
    Task<List<T>> GetAll();
    Task<List<T>> GetAllFiltered(Expression<Func<T, bool>> predicate);
    Task<List<T>> GetPaginated(int pageNumber, int pageSize, Expression<Func<T, bool>> filter);
    Task<int> Count();
    Task<int> CountFiltered(Expression<Func<T, bool>> predicate);
    Task<bool> Update(T entity);
    Task<bool> Delete(T entity);

    Task<TTransaction> ExecuteInTransaction<TTransaction>(Func<CancellationToken, Task<TTransaction>> func,
        CancellationToken cancellationToken = default);
}
