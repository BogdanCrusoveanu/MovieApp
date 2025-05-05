namespace BusinessLogic.Results
{
    public class ServiceResult<T> : ServiceResult
    {
        public T? Data { get; private set; }

        public static ServiceResult<T> Success(T data) => new ServiceResult<T> { Succeeded = true, Data = data };

        // Need new Failed methods because the base class ones return ServiceResult, not ServiceResult<T>
        public new static ServiceResult<T> Failed(params string[] errors) => new ServiceResult<T> { Succeeded = false, Errors = errors };
        public new static ServiceResult<T> Failed(IEnumerable<string> errors) => new ServiceResult<T> { Succeeded = false, Errors = errors };

        // Implicit conversion for convenience in service methods
        public static implicit operator ServiceResult<T>(string error) => Failed(error);
        public static implicit operator ServiceResult<T>(List<string> errors) => Failed(errors);
    }
}
