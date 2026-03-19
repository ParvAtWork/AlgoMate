# AlgoMate Backend

> **Smart DSA Coding & Compilation Platform API**
> Built with ASP.NET Core 9 · PostgreSQL · Supabase · Judge0 CE

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Configuration](#configuration)
    - [Running the Project](#running-the-project)
- [Authentication](#authentication)
- [API Reference](#api-reference)
    - [Auth](#auth-endpoints)
    - [Admin](#admin-endpoints)
    - [Problem](#problem-endpoints)
    - [Compiler](#compiler-endpoints)
    - [Submission](#submission-endpoints)
    - [Leaderboard](#leaderboard-endpoints)
    - [User](#user-endpoints)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Folder Architecture](#folder-architecture)
- [Roadmap](#roadmap)

---

## Overview

AlgoMate is a personal full-stack DSA (Data Structures & Algorithms) coding platform — similar to LeetCode — built from scratch. Users can browse problems, submit code in multiple programming languages, get real-time execution results, and track their progress on a leaderboard.

The backend is a RESTful API built with ASP.NET Core 9, using Supabase for authentication and PostgreSQL as the database. Code compilation is powered by Judge0 CE via RapidAPI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | ASP.NET Core 9 Web API |
| Language | C# (.NET 9) |
| Database | PostgreSQL (via Supabase) |
| ORM | Entity Framework Core + Npgsql |
| Authentication | Supabase Auth (JWT HS256) |
| Code Compiler | Judge0 CE via RapidAPI |
| API Documentation | Swagger / OpenAPI 3.0 |
| Frontend (Planned) | React + Vite |

---

## Project Structure

```
algomate-backend/
├── Controllers/                  # API endpoints
│   ├── AdminController.cs
│   ├── AuthController.cs
│   ├── CompilerController.cs
│   ├── LeaderboardController.cs
│   ├── ProblemController.cs
│   ├── SubmissionController.cs
│   └── UserController.cs
├── Data/
│   └── AlgoMateDbContext.cs      # EF Core DB context
├── DTOs/                         # Data Transfer Objects
│   ├── LeaderboardDto.cs
│   ├── ProblemDto.cs
│   ├── SignupRequest.cs
│   └── SubmissionDto.cs
├── Models/                       # Database entity models
│   ├── Leaderboard.cs
│   ├── Problem.cs
│   ├── Recommendation.cs
│   ├── Submission.cs
│   ├── TestCase.cs
│   └── User.cs
├── Repositories/                 # Data access layer
│   ├── IUserRepository.cs / UserRepository.cs
│   ├── IProblemRepository.cs / ProblemRepository.cs
│   ├── ISubmissionRepository.cs / SubmissionRepository.cs
│   └── ILeaderboardRepository.cs / LeaderboardRepository.cs
├── Services/                     # Business logic layer
│   ├── AuthServices.cs
│   ├── CompilerService.cs
│   ├── LeaderboardService.cs
│   ├── ProblemService.cs
│   ├── RecommendationService.cs
│   └── RoleClaimsTransformer.cs
├── Middleware/
│   ├── ErrorHandlingMiddleware.cs
│   └── JwtMiddleware.cs
├── Enums/                        # Strongly typed enums
│   ├── Difficulty.cs
│   ├── LeaderboardPeriod.cs
│   ├── ProgrammingLanguage.cs
│   └── SubmissionStatus.cs
├── Exceptions/                   # Custom exception types
│   ├── BadRequestException.cs
│   ├── CompilerException.cs
│   ├── DuplicateException.cs
│   ├── NotFoundException.cs
│   ├── RateLimitException.cs
│   ├── UnauthorizedException.cs
│   └── ValidationException.cs
├── Constants/                    # Centralized constants
│   ├── AppConstants.cs
│   ├── ErrorMessages.cs
│   ├── JudgeConstants.cs
│   ├── Roles.cs
│   └── ValidationMessages.cs
├── Configuration/                # Strongly typed settings
│   ├── CompilerSettings.cs
│   ├── CorsSettings.cs
│   ├── JwtSettings.cs
│   └── SupabaseSettings.cs
├── Extensions/                   # Service & middleware extensions
│   ├── ClaimsPrincipalExtensions.cs
│   ├── MiddlewareExtensions.cs
│   └── ServiceCollectionExtensions.cs
├── Validators/                   # Input validation
│   ├── ProblemValidator.cs
│   ├── SignupRequestValidator.cs
│   ├── SubmissionValidator.cs
│   ├── UserValidator.cs
│   └── ValidationResult.cs
├── Migrations/                   # EF Core migrations
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [PostgreSQL](https://www.postgresql.org/) — or a [Supabase](https://supabase.com/) project
- [Supabase Account](https://supabase.com/) — for Auth + Database
- [RapidAPI Account](https://rapidapi.com/) — for Judge0 CE access
- [JetBrains Rider](https://www.jetbrains.com/rider/) or [Visual Studio](https://visualstudio.microsoft.com/)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/algomate-backend.git
cd algomate-backend
```

**2. Install dependencies**

```bash
dotnet restore
```

**3. Initialize user secrets**

```bash
dotnet user-secrets init
```

**4. Set required secrets** (see [Configuration](#configuration))

```bash
dotnet user-secrets set "Supabase:JwtSecret" "your-supabase-jwt-secret"
dotnet user-secrets set "Supabase:AnonKey" "your-supabase-anon-key"
dotnet user-secrets set "Supabase:ServiceRoleKey" "your-supabase-service-role-key"
dotnet user-secrets set "Compiler:ApiKey" "your-rapidapi-key"
```

**5. Apply database migrations**

```bash
dotnet ef database update
```

**6. Run the project**

```bash
dotnet run
```

API will be available at:
- HTTP: `http://localhost:5270`
- HTTPS: `https://localhost:7167`
- Swagger UI: `http://localhost:5270/swagger`

---

### Configuration

Update `appsettings.json` with your values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.your-project.supabase.co;Port=5432;Database=postgres;User Id=postgres;Password=your-db-password;Ssl Mode=Require;Trust Server Certificate=true"
  },
  "Supabase": {
    "Url": "https://your-project-ref.supabase.co",
    "AnonKey": "SEE_USER_SECRETS",
    "ServiceRoleKey": "SEE_USER_SECRETS",
    "JwtSecret": "SEE_USER_SECRETS",
    "ProjectRef": "your-project-ref"
  },
  "Compiler": {
    "BaseUrl": "https://judge0-ce.p.rapidapi.com",
    "ApiKey": "SEE_USER_SECRETS",
    "ApiHost": "judge0-ce.p.rapidapi.com"
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173"
    ]
  }
}
```

> **Security Note:** Never commit actual secrets to version control. All sensitive values must be stored in .NET User Secrets (development) or environment variables (production).

---

### Running the Project

```bash
# Development
dotnet run

# With watch (hot reload)
dotnet watch run

# Build only
dotnet build

# Run tests
dotnet test
```

---

## Authentication

AlgoMate uses **Supabase Auth** with **JWT HS256** tokens.

### Flow

```
1. User signs up / logs in via Supabase Auth
2. Supabase returns a JWT access token
3. Client sends token in Authorization header
4. Backend validates token using Supabase JWT Secret
5. RoleClaimsTransformer injects DB role into claims
```

### Using the Token

```http
GET /api/Auth/me
Authorization: Bearer <your-supabase-jwt-token>
```

### Generating a Token (PowerShell)

```powershell
$token = (Invoke-RestMethod `
  -Method Post `
  -Uri "https://your-project.supabase.co/auth/v1/token?grant_type=password" `
  -Headers @{
    "apikey" = "your-anon-key"
    "Content-Type" = "application/json"
  } `
  -Body '{"email":"your@email.com","password":"yourpassword"}' `
).access_token

$token | Set-Clipboard
Write-Host "Token copied!"
```

### User Roles

| Role | Description |
|------|-------------|
| `Student` | Default role — can submit code, view problems |
| `Admin` | Full access — manage problems, users, leaderboard |
| `Contributor` | Users with rating ≥ 2000 — can submit problems for review |

---

## API Reference

Base URL: `http://localhost:5270/api`

All protected endpoints require:
```
Authorization: Bearer <jwt-token>
```

---

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/Auth/register` | ✅ Required | Register user after Supabase signup |
| `GET` | `/Auth/me` | ✅ Required | Get current user profile |
| `GET` | `/Auth/check` | ✅ Required | Validate JWT token |

**POST /Auth/register**
```json
{
  "username": "ParvMaheshwari"
}
```

---

### Admin Endpoints

All Admin endpoints require `Admin` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Admin/stats` | Dashboard statistics |
| `GET` | `/Admin/users` | All users list |
| `PUT` | `/Admin/users/{id}/role` | Update user role |
| `PUT` | `/Admin/users/{id}/premium` | Toggle premium status |
| `DELETE` | `/Admin/users/{id}` | Delete user |
| `POST` | `/Admin/problems` | Add new problem |
| `GET` | `/Admin/problems/{id}` | Get problem by ID |
| `PUT` | `/Admin/problems/{id}` | Update problem |
| `DELETE` | `/Admin/problems/{id}` | Delete problem (soft) |
| `GET` | `/Admin/submissions` | All submissions |
| `GET` | `/Admin/submissions/recent` | Recent submissions |
| `POST` | `/Admin/leaderboard/recalculate` | Recalculate rankings |

---

### Problem Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/Problem` | ❌ Public | Get all active problems |
| `GET` | `/Problem/{id}` | ❌ Public | Get problem by ID |
| `GET` | `/Problem/topic/{topic}` | ❌ Public | Filter by topic |
| `GET` | `/Problem/difficulty/{difficulty}` | ❌ Public | Filter by difficulty |
| `GET` | `/Problem/filter` | ❌ Public | Filter by topic + difficulty |
| `POST` | `/Problem` | ✅ Admin | Add problem |
| `PUT` | `/Problem/{id}` | ✅ Admin | Update problem |
| `DELETE` | `/Problem/{id}` | ✅ Admin | Delete problem |
| `GET` | `/Problem/{id}/testcases` | ✅ Admin | Get test cases |

**Difficulty values:** `Easy` · `Medium` · `Hard`

**POST /Problem** request body:
```json
{
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "Easy",
  "topic": "Array",
  "inputFormat": "First line: n and target. Second line: array.",
  "outputFormat": "Two indices separated by space.",
  "sampleInput": "4\n2 7 11 15\n9",
  "sampleOutput": "0 1",
  "constraints": "2 <= nums.length <= 10^4",
  "timeLimitMs": 2000,
  "memoryLimitMb": 256,
  "maxScore": 100,
  "contributorName": "ParvMaheshwari"
}
```

---

### Compiler Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/Compiler/languages` | ❌ Public | Supported languages list |
| `POST` | `/Compiler/submit` | ✅ Required | Submit code for execution |
| `GET` | `/Compiler/result/{token}` | ✅ Required | Get execution result |

**Supported Languages:**

| Language | Judge0 ID |
|----------|-----------|
| Python 3 | 71 |
| C++ | 54 |
| Java | 62 |
| C | 50 |
| C# | 51 |
| JavaScript | 63 |
| Go | 60 |
| Ruby | 72 |

**POST /Compiler/submit** request body:
```json
{
  "problemId": 1,
  "code": "print('Hello World')",
  "languageId": 71
}
```

**Response:**
```json
{
  "message": "Code submitted successfully.",
  "submissionId": 4,
  "judge0Token": "88bb300a-396e-4500-b5af-45536e2498d4",
  "status": "Pending"
}
```

**Submission Status values:** `Pending` · `Processing` · `Accepted` · `Wrong Answer` · `Runtime Error` · `Compilation Error` · `Time Limit Exceeded`

---

### Submission Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/Submission/my` | ✅ Required | My submissions |
| `GET` | `/Submission/{id}` | ✅ Required | Submission by ID |
| `GET` | `/Submission/problem/{problemId}` | ✅ Admin | Submissions by problem |
| `GET` | `/Submission/check/{problemId}` | ✅ Required | Check if problem solved |
| `GET` | `/Submission/recent` | ✅ Admin | Recent submissions |

---

### Leaderboard Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/Leaderboard` | ❌ Public | Top rankers (default: top 20) |
| `GET` | `/Leaderboard/period/{period}` | ❌ Public | Rankings by period |
| `GET` | `/Leaderboard/me` | ✅ Required | My leaderboard rank |
| `GET` | `/Leaderboard/user/{userId}` | ❌ Public | User rank by ID |
| `POST` | `/Leaderboard/recalculate` | ✅ Admin | Recalculate all ranks |

**Period values:** `Weekly` · `Monthly` · `AllTime`

---

### User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/User/me` | ✅ Required | My profile |
| `PUT` | `/User/me` | ✅ Required | Update my profile |
| `GET` | `/User/{id}` | ✅ Required | User profile by ID |
| `POST` | `/User/register` | ✅ Required | Register user profile |
| `GET` | `/User/top/{count}` | ✅ Required | Top users by rating |
| `GET` | `/User/all` | ✅ Admin | All users |

---

## Database Schema

```
Users
├── Id (PK)
├── SupabaseUid (unique)
├── Username
├── Email
├── Role (Student / Admin / Contributor)
├── Rating
├── ProblemsSolved
├── TotalSubmissions
├── IsPremium
├── AvatarUrl
├── CreatedAt
└── LastLoginAt

Problems
├── Id (PK)
├── Title
├── Description
├── Difficulty (Easy / Medium / Hard)
├── Topic
├── InputFormat / OutputFormat
├── SampleInput / SampleOutput
├── Constraints
├── TimeLimitMs
├── MemoryLimitMb
├── MaxScore
├── TotalSubmissions
├── AcceptedSubmissions
├── IsActive
├── ContributorName
└── CreatedAt

Submissions
├── Id (PK)
├── UserId (FK → Users)
├── ProblemId (FK → Problems)
├── Code
├── Language / LanguageId
├── Status
├── Output / ErrorMessage
├── ExecutionTimeMs
├── MemoryUsedMb
├── Score
├── TestCasesPassed / TotalTestCases
├── IsSuccessful
├── Judge0Token
└── SubmittedAt

TestCases
├── Id (PK)
├── ProblemId (FK → Problems)
├── Input
├── ExpectedOutput
├── IsHidden
└── Points

Leaderboards
├── Id (PK)
├── UserId (FK → Users)
├── Rank
├── Score
├── ProblemsSolved
├── TotalSubmissions
├── AccuracyPercent
├── BadgeTitle
├── Period
└── LastUpdated
```

---

## Environment Variables

| Key | Description | Source |
|-----|-------------|--------|
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string | `appsettings.json` |
| `Supabase:Url` | Supabase project URL | `appsettings.json` |
| `Supabase:ProjectRef` | Supabase project reference ID | `appsettings.json` |
| `Supabase:JwtSecret` | Supabase Legacy JWT Secret (HS256) | **User Secrets** |
| `Supabase:AnonKey` | Supabase anonymous public key | **User Secrets** |
| `Supabase:ServiceRoleKey` | Supabase service role key | **User Secrets** |
| `Compiler:BaseUrl` | Judge0 CE base URL | `appsettings.json` |
| `Compiler:ApiHost` | RapidAPI host header | `appsettings.json` |
| `Compiler:ApiKey` | RapidAPI key for Judge0 | **User Secrets** |
| `Cors:AllowedOrigins` | Allowed frontend origins | `appsettings.json` |

> All keys marked **User Secrets** must never be committed to version control.

---

## Folder Architecture

AlgoMate follows a clean layered architecture pattern:

```
Request → Controller → Validator → Service → Repository → Database
                           ↓
                     ErrorMiddleware
                           ↓
                      Constants / Enums
```

| Layer | Folder | Responsibility |
|-------|--------|---------------|
| API Layer | `Controllers/` | Handle HTTP requests/responses |
| Validation | `Validators/` | Input validation before processing |
| Business Logic | `Services/` | Core application logic |
| Data Access | `Repositories/` | Database queries via EF Core |
| Domain Models | `Models/` | Database entity definitions |
| Transfer Objects | `DTOs/` | API request/response shapes |
| Cross-cutting | `Middleware/` | Error handling, JWT processing |
| Configuration | `Configuration/` | Strongly typed settings classes |
| Constants | `Constants/` | Centralized strings and values |
| Enums | `Enums/` | Type-safe enum definitions |
| Exceptions | `Exceptions/` | Custom exception types |
| Extensions | `Extensions/` | Service and middleware helpers |

---

## Roadmap

### Backend
- [ ] Unit tests with xUnit
- [ ] Serilog structured logging
- [ ] Rate limiting per user
- [ ] Problem recommendations engine
- [ ] Production deployment (Azure / Railway)
- [ ] `appsettings.Production.json`

### Frontend (React + Vite)
- [ ] Problem list page
- [ ] Problem detail + code editor (Monaco Editor)
- [ ] Submission result page
- [ ] Leaderboard page
- [ ] User profile page
- [ ] Admin dashboard

---

## Author

**Parv Maheshwari**
Personal project — AlgoMate DSA Platform

---

*Built with using ASP.NET Core 9*