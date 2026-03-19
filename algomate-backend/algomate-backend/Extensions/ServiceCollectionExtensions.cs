using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication;
using System.Text;
using AlgoMateBackend.Data;
using AlgoMateBackend.Repositories;
using AlgoMateBackend.Services;
using AlgoMateBackend.Constants;
using AlgoMateBackend.Configuration;

namespace AlgoMateBackend.Extensions
{
    /// <summary>
    /// Extension methods for IServiceCollection to organize
    /// dependency injection registrations in Program.cs.
    /// Keeps Program.cs clean and maintainable.
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Registers all database related services
        /// </summary>
        public static IServiceCollection AddDatabase(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddDbContext<AlgoMateDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection")
                )
            );
            return services;
        }

        /// <summary>
        /// Registers all repository services
        /// </summary>
        public static IServiceCollection AddRepositories(
            this IServiceCollection services)
        {
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IProblemRepository, ProblemRepository>();
            services.AddScoped<ISubmissionRepository, SubmissionRepository>();
            services.AddScoped<ILeaderboardRepository, LeaderboardRepository>();
            return services;
        }

        /// <summary>
        /// Registers all business logic services
        /// </summary>
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IProblemService, ProblemService>();
            services.AddScoped<ICompilerService, CompilerService>();
            services.AddScoped<ILeaderboardService, LeaderboardService>();
            services.AddScoped<IRecommendationService, RecommendationService>();

            // Role Claims Transformer — Supabase JWT mein DB role inject karta hai
            services.AddScoped<IClaimsTransformation, RoleClaimsTransformer>();

            return services;
        }

        /// <summary>
        /// Registers Judge0 HTTP client with RapidAPI configuration
        /// </summary>
        public static IServiceCollection AddJudge0Client(
            this IServiceCollection services,
            CompilerSettings compilerSettings)
        {
            services.AddHttpClient("Judge0", httpClient =>
            {
                httpClient.BaseAddress = new Uri(compilerSettings.BaseUrl);
                httpClient.DefaultRequestHeaders.Add(
                    "x-rapidapi-key", compilerSettings.ApiKey);
                httpClient.DefaultRequestHeaders.Add(
                    "x-rapidapi-host", compilerSettings.ApiHost);
            });
            return services;
        }

        /// <summary>
        /// Registers JWT authentication with Supabase HS256 validation
        /// </summary>
        public static IServiceCollection AddJwtAuthentication(
            this IServiceCollection services,
            SupabaseSettings supabaseSettings)
        {
            var key = Encoding.UTF8.GetBytes(supabaseSettings.JwtSecret);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            services.AddAuthorization();
            return services;
        }

        /// <summary>
        /// Registers CORS policy with allowed origins from configuration
        /// </summary>
        public static IServiceCollection AddCorsPolicy(
            this IServiceCollection services,
            CorsSettings corsSettings)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(AppConstants.CorsPolicyName, policy =>
                {
                    policy.WithOrigins(corsSettings.GetAllowedOrigins())
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });
            return services;
        }

        /// <summary>
        /// Registers controllers with JSON configuration
        /// </summary>
        public static IServiceCollection AddControllersWithConfig(
            this IServiceCollection services)
        {
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    // Circular reference fix
                    options.JsonSerializerOptions.ReferenceHandler =
                        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.WriteIndented = true;
                });
            return services;
        }

        /// <summary>
        /// Registers Swagger with JWT bearer authentication support
        /// </summary>
        public static IServiceCollection AddSwaggerWithJwt(
            this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "AlgoMate API",
                    Version = "v1",
                    Description = "Smart DSA Coding & Compilation Platform API"
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your Supabase JWT token here"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
            return services;
        }

        /// <summary>
        /// Registers strongly typed configuration classes
        /// </summary>
        public static IServiceCollection AddApplicationConfiguration(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.Configure<SupabaseSettings>(
                configuration.GetSection(SupabaseSettings.SectionName));
            services.Configure<CompilerSettings>(
                configuration.GetSection(CompilerSettings.SectionName));
            services.Configure<CorsSettings>(
                configuration.GetSection(CorsSettings.SectionName));
            services.Configure<JwtSettings>(
                configuration.GetSection(JwtSettings.SectionName));
            return services;
        }
    }
}