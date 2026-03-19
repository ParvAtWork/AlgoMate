using AlgoMateBackend.Configuration;
using AlgoMateBackend.Extensions; // ← ADDED

namespace AlgoMateBackend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // =============================================
            // 0. CONFIGURATION — Strongly typed settings
            // =============================================
            builder.Services.AddApplicationConfiguration(builder.Configuration);

            // ← Validate settings at startup
            var supabaseSettings = builder.Configuration
                .GetSection(SupabaseSettings.SectionName)
                .Get<SupabaseSettings>() ?? new SupabaseSettings();
            supabaseSettings.Validate();

            var compilerSettings = builder.Configuration
                .GetSection(CompilerSettings.SectionName)
                .Get<CompilerSettings>() ?? new CompilerSettings();
            compilerSettings.Validate();

            var corsSettings = builder.Configuration
                .GetSection(CorsSettings.SectionName)
                .Get<CorsSettings>() ?? new CorsSettings();
            corsSettings.Validate();

            // =============================================
            // 1. DATABASE
            // =============================================
            builder.Services.AddDatabase(builder.Configuration);

            // =============================================
            // 2. REPOSITORIES
            // =============================================
            builder.Services.AddRepositories();

            // =============================================
            // 3. SERVICES
            // =============================================
            builder.Services.AddApplicationServices();

            // =============================================
            // 4. JUDGE0 HTTP CLIENT
            // =============================================
            builder.Services.AddJudge0Client(compilerSettings);

            // =============================================
            // 5. JWT AUTHENTICATION
            // =============================================
            builder.Services.AddJwtAuthentication(supabaseSettings);

            // =============================================
            // 6. CORS
            // =============================================
            builder.Services.AddCorsPolicy(corsSettings);

            // =============================================
            // 7. CONTROLLERS + SWAGGER
            // =============================================
            builder.Services.AddControllersWithConfig();
            builder.Services.AddSwaggerWithJwt();

            // =============================================
            // 8. BUILD + PIPELINE
            // =============================================
            var app = builder.Build();
            app.UseAlgoMatePipeline();
            app.Run();
        }
    }
}







// using Microsoft.AspNetCore.Builder;
// using Microsoft.Extensions.DependencyInjection;
// using Microsoft.Extensions.Hosting;
// using Microsoft.Extensions.Configuration;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.Authentication.JwtBearer;
// using Microsoft.IdentityModel.Tokens;
// using Microsoft.OpenApi.Models;
// using System.Text;
// using AlgoMateBackend.Data;
// using AlgoMateBackend.Middleware;
// using AlgoMateBackend.Repositories;
// using AlgoMateBackend.Services;
// using AlgoMateBackend.Constants;
// using AlgoMateBackend.Configuration; // ← ADDED
// using Microsoft.AspNetCore.Authentication;
//
// namespace AlgoMateBackend
// {
//     public class Program
//     {
//         public static void Main(string[] args)
//         {
//             var builder = WebApplication.CreateBuilder(args);
//
//             // =============================================
//             // 0. CONFIGURATION — Strongly typed settings
//             // =============================================
//
//             // ← ADDED — Strongly typed configuration register karo
//             builder.Services.Configure<SupabaseSettings>(
//                 builder.Configuration.GetSection(SupabaseSettings.SectionName));
//
//             builder.Services.Configure<CompilerSettings>(
//                 builder.Configuration.GetSection(CompilerSettings.SectionName));
//
//             builder.Services.Configure<CorsSettings>(
//                 builder.Configuration.GetSection(CorsSettings.SectionName));
//
//             builder.Services.Configure<JwtSettings>(
//                 builder.Configuration.GetSection(JwtSettings.SectionName));
//
//             // ← ADDED — Validate settings at startup
//             var supabaseSettings = builder.Configuration
//                 .GetSection(SupabaseSettings.SectionName)
//                 .Get<SupabaseSettings>() ?? new SupabaseSettings();
//             supabaseSettings.Validate();
//
//             var compilerSettings = builder.Configuration
//                 .GetSection(CompilerSettings.SectionName)
//                 .Get<CompilerSettings>() ?? new CompilerSettings();
//             compilerSettings.Validate();
//
//             var corsSettings = builder.Configuration
//                 .GetSection(CorsSettings.SectionName)
//                 .Get<CorsSettings>() ?? new CorsSettings();
//             corsSettings.Validate();
//
//             // =============================================
//             // 1. DATABASE — EF Core with Supabase PostgreSQL
//             // =============================================
//             builder.Services.AddDbContext<AlgoMateDbContext>(options =>
//                 options.UseNpgsql(
//                     builder.Configuration.GetConnectionString("DefaultConnection")
//                 )
//             );
//
//             // =============================================
//             // 2. REPOSITORIES — interface only, no duplicates
//             // =============================================
//             builder.Services.AddScoped<IUserRepository, UserRepository>();
//             builder.Services.AddScoped<IProblemRepository, ProblemRepository>();
//             builder.Services.AddScoped<ISubmissionRepository, SubmissionRepository>();
//             builder.Services.AddScoped<ILeaderboardRepository, LeaderboardRepository>();
//
//             // =============================================
//             // 3. SERVICES — business logic layer
//             // =============================================
//             builder.Services.AddScoped<IAuthService, AuthService>();
//             builder.Services.AddScoped<IProblemService, ProblemService>();
//             builder.Services.AddScoped<ICompilerService, CompilerService>();
//             builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
//             builder.Services.AddScoped<IRecommendationService, RecommendationService>();
//
//             // =============================================
//             // 3.1 ROLE CLAIMS TRANSFORMER
//             // Supabase JWT mein "authenticated" role hoti hai
//             // Yeh transformer DB se actual role inject karta hai
//             // =============================================
//             builder.Services.AddScoped<IClaimsTransformation, RoleClaimsTransformer>();
//
//             // =============================================
//             // 4. JUDGE0 HTTP CLIENT
//             // ← EDITED — CompilerSettings use kiya
//             // =============================================
//             builder.Services.AddHttpClient("Judge0", httpClient =>
//             {
//                 httpClient.BaseAddress = new Uri(
//                     compilerSettings.BaseUrl
//                 );
//                 httpClient.DefaultRequestHeaders.Add(
//                     "x-rapidapi-key",
//                     compilerSettings.ApiKey
//                 );
//                 httpClient.DefaultRequestHeaders.Add(
//                     "x-rapidapi-host",
//                     compilerSettings.ApiHost
//                 );
//             });
//
//             // =============================================
//             // 5. JWT AUTHENTICATION — Supabase HS256
//             // ← EDITED — SupabaseSettings use kiya
//             // =============================================
//             var key = Encoding.UTF8.GetBytes(supabaseSettings.JwtSecret);
//
//             builder.Services.AddAuthentication(options =>
//             {
//                 options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//                 options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//             })
//             .AddJwtBearer(options =>
//             {
//                 options.RequireHttpsMetadata = false;
//                 options.SaveToken = false;
//                 options.TokenValidationParameters = new TokenValidationParameters
//                 {
//                     ValidateIssuerSigningKey = true,
//                     IssuerSigningKey = new SymmetricSecurityKey(key),
//                     ValidateIssuer = false,
//                     ValidateAudience = false,
//                     ValidateLifetime = true,
//                     ClockSkew = TimeSpan.Zero
//                 };
//             });
//             builder.Services.AddAuthorization();
//
//             // =============================================
//             // 6. CORS — allow React frontend origins
//             // ← EDITED — CorsSettings use kiya
//             // =============================================
//             builder.Services.AddCors(options =>
//             {
//                 options.AddPolicy(AppConstants.CorsPolicyName, policy =>
//                 {
//                     policy.WithOrigins(corsSettings.GetAllowedOrigins())
//                           .AllowAnyHeader()
//                           .AllowAnyMethod();
//                 });
//             });
//
//             // =============================================
//             // 7. CONTROLLERS + SWAGGER
//             // =============================================
//             builder.Services.AddControllers()
//                 .AddJsonOptions(options =>
//                 {
//                     // Circular reference fix — Problem → TestCase → Problem loop todta hai
//                     options.JsonSerializerOptions.ReferenceHandler =
//                         System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
//                     options.JsonSerializerOptions.WriteIndented = true;
//                 });
//
//             builder.Services.AddEndpointsApiExplorer();
//             builder.Services.AddSwaggerGen(options =>
//             {
//                 options.SwaggerDoc("v1", new OpenApiInfo
//                 {
//                     Title = "AlgoMate API",
//                     Version = "v1",
//                     Description = "Smart DSA Coding & Compilation Platform API"
//                 });
//
//                 options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//                 {
//                     Name = "Authorization",
//                     Type = SecuritySchemeType.Http,
//                     Scheme = "Bearer",
//                     BearerFormat = "JWT",
//                     In = ParameterLocation.Header,
//                     Description = "Enter your Supabase JWT token here"
//                 });
//                 options.AddSecurityRequirement(new OpenApiSecurityRequirement
//                 {
//                     {
//                         new OpenApiSecurityScheme
//                         {
//                             Reference = new OpenApiReference
//                             {
//                                 Type = ReferenceType.SecurityScheme,
//                                 Id = "Bearer"
//                             }
//                         },
//                         Array.Empty<string>()
//                     }
//                 });
//             });
//
//             // =============================================
//             // 8. BUILD APP
//             // =============================================
//             var app = builder.Build();
//
//             // =============================================
//             // 9. MIDDLEWARE PIPELINE — order matters
//             // =============================================
//             if (app.Environment.IsDevelopment())
//             {
//                 app.UseSwagger();
//                 app.UseSwaggerUI(options =>
//                 {
//                     options.SwaggerEndpoint("/swagger/v1/swagger.json", "AlgoMate API v1");
//                 });
//             }
//             else
//             {
//                 app.UseHsts();
//             }
//
//             app.UseCors(AppConstants.CorsPolicyName);
//
//             app.UseAuthentication();
//             app.UseAuthorization();
//
//             app.UseMiddleware<ErrorHandlingMiddleware>();
//
//             app.MapControllers();
//
//             app.Run();
//         }
//     }
// }
//


