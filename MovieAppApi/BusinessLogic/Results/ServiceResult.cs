namespace BusinessLogic.Results
{
    public class ServiceResult
    {
        public bool Succeeded { get; protected set; }
        public IEnumerable<string> Errors { get; protected set; } = Enumerable.Empty<string>();

        public static ServiceResult Success() => new ServiceResult { Succeeded = true };

        public static ServiceResult Failed(params string[] errors) => new ServiceResult { Succeeded = false, Errors = errors };
        public static ServiceResult Failed(IEnumerable<string> errors) => new ServiceResult { Succeeded = false, Errors = errors };

        // Implicit conversion for convenience in service methods
        public static implicit operator ServiceResult(string error) => Failed(error);
        public static implicit operator ServiceResult(List<string> errors) => Failed(errors);
    }
}
