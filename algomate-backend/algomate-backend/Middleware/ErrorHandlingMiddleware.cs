using System.Net;
using System.Text.Json;
using AlgoMateBackend.Exceptions; // ← ADDED

namespace AlgoMateBackend.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(
            RequestDelegate next,
            ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(
            HttpContext context,
            Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new ErrorResponse();

            switch (exception)
            {
                // ← ADDED — Custom Exceptions pehle check karo
                case NotFoundException notFound:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.Message = notFound.Message;
                    break;

                case UnauthorizedException unauthorized:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.Message = unauthorized.Message;
                    break;

                case ValidationException validation:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Message = validation.Message;
                    response.Errors = validation.Errors;
                    break;

                case CompilerException compiler:
                    context.Response.StatusCode = (int)HttpStatusCode.BadGateway;
                    response.StatusCode = (int)HttpStatusCode.BadGateway;
                    response.Message = compiler.Message;
                    break;

                case DuplicateException duplicate:
                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                    response.StatusCode = (int)HttpStatusCode.Conflict;
                    response.Message = duplicate.Message;
                    break;

                case RateLimitException rateLimit:
                    context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                    response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                    response.Message = rateLimit.Message;
                    response.RetryAfterSeconds = rateLimit.RetryAfterSeconds;
                    break;

                case BadRequestException badRequest:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Message = badRequest.Message;
                    response.Errors = badRequest.Errors;
                    break;

                // Existing .NET Exceptions
                case ArgumentNullException:
                case ArgumentException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Message = exception.Message;
                    break;

                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.Message = "Unauthorized access.";
                    break;

                case KeyNotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.Message = exception.Message;
                    break;

                case HttpRequestException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadGateway;
                    response.StatusCode = (int)HttpStatusCode.BadGateway;
                    response.Message = "External service error. Please try again.";
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response.Message = "An unexpected error occurred. Please try again.";
                    break;
            }

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var json = JsonSerializer.Serialize(response, options);
            await context.Response.WriteAsync(json);
        }
    }

    // ← EDITED — Errors aur RetryAfterSeconds add kiye
    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public IEnumerable<string>? Errors { get; set; }
        public int? RetryAfterSeconds { get; set; }
        public string Timestamp { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
    }
}



