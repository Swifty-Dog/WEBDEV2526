namespace OfficeCalendar.API.Models.Repositories.Interfaces;

public interface IRepository<T> where T : class
{
    Task<bool> Create(T entity);
    Task<T?> GetById(long id);
    Task<List<T>> GetAll();
    Task<int> Count();
    Task<bool> Update(T entity);
    Task<bool> Delete(T entity);
}