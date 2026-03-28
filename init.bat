@echo off
REM API Toolkit Backend - Quick Start Script for Windows

echo.
echo 🚀 API Toolkit Backend - Initialization Script
echo ============================================== 
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...

where java >nul 2>nul
if errorlevel 1 (
    echo ❌ Java is not installed. Please install Java 21 or higher.
    exit /b 1
)

for /f "tokens=*" %%A in ('java -version 2^>^&1 ^| findstr /R "version"') do set JAVA_VERSION=%%A
echo ✅ %JAVA_VERSION% found

echo.
echo 🔧 Initializing project...

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update .env with your configuration
) else (
    echo ✅ .env file already exists
)

echo.
echo 📦 Building project...

REM Check if mvnw.cmd exists
if exist "mvnw.cmd" (
    call mvnw.cmd clean install
) else (
    mvn clean install
)

echo.
echo ✅ Build completed successfully!
echo.
echo 🚀 Next steps:
echo 1. Update .env file with your configuration
echo 2. Start MySQL: docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:8
echo 3. Create database: CREATE DATABASE apitoolkitdb;
echo 4. Start application: mvnw.cmd spring-boot:run
echo 5. Access API at: http://localhost:8080/api
echo 6. Access Swagger UI at: http://localhost:8080/api/swagger-ui.html
echo.
echo Or use Docker Compose for everything:
echo docker-compose up -d
echo.
pause
