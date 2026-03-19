namespace AlgoMateBackend.Exceptions
{
    /// <summary>
    /// Thrown when a requested resource is not found in the database.
    /// Maps to HTTP 404 Not Found response.
    /// </summary>
    /// <example>
    /// throw new NotFoundException("Problem", 1);
    /// throw new NotFoundException("User not found.");
    /// </example>
    public class NotFoundException : Exception
    {
        /// <summary>Name of the resource that was not found</summary>
        public string ResourceName { get; }

        /// <summary>ID of the resource that was not found</summary>
        public object ResourceId { get; }

        public NotFoundException(string resourceName, object resourceId)
            : base($"{resourceName} with ID '{resourceId}' was not found.")
        {
            ResourceName = resourceName;
            ResourceId = resourceId;
        }

        public NotFoundException(string message)
            : base(message)
        {
            ResourceName = string.Empty;
            ResourceId = string.Empty;
        }
    }
}