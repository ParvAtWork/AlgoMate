using AlgoMateBackend.Constants;
using AlgoMateBackend.Middleware;

namespace AlgoMateBackend.Extensions
{
    /// <summary>
    /// Extension methods for IApplicationBuilder to organize
    /// middleware pipeline configuration in Program.cs.
    /// Ensures correct middleware ordering.
    /// </summary>
    public static class MiddlewareExtensions
    {
        /// <summary>
        /// Configures Swagger middleware for development environment.
        /// Swagger UI is only enabled in Development.
        /// </summary>
        public static IApplicationBuilder UseSwaggerInDevelopment(
            this IApplicationBuilder app,
            IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint(
                        "/swagger/v1/swagger.json",
                        "AlgoMate API v1");
                });
            }
            else
            {
                // Production mein HTTPS enforce karo
                app.UseHsts();
            }
            return app;
        }

        /// <summary>
        /// Configures the complete security middleware pipeline.
        /// Order matters — CORS → Authentication → Authorization
        /// </summary>
        public static IApplicationBuilder UseSecurityPipeline(
            this IApplicationBuilder app)
        {
            // CORS — authentication se pehle hona chahiye
            app.UseCors(AppConstants.CorsPolicyName);

            // Authentication — WHO are you?
            app.UseAuthentication();

            // Authorization — WHAT can you do?
            app.UseAuthorization();

            return app;
        }

        /// <summary>
        /// Configures global error handling middleware.
        /// Must be registered before other middleware to catch all exceptions.
        /// </summary>
        public static IApplicationBuilder UseGlobalErrorHandling(
            this IApplicationBuilder app)
        {
            app.UseMiddleware<ErrorHandlingMiddleware>();
            return app;
        }

        /// <summary>
        /// Configures the complete middleware pipeline in correct order.
        /// Combines all middleware registrations.
        /// </summary>
        public static WebApplication UseAlgoMatePipeline(
            this WebApplication app)
        {
            // 1. Swagger — development only
            app.UseSwaggerInDevelopment(app.Environment);

            // 2. Global error handling
            app.UseGlobalErrorHandling();

            // 3. Security pipeline — CORS, Auth, AuthZ
            app.UseSecurityPipeline();

            // 4. Controllers
            app.MapControllers();

            return app;
        }
    }
}