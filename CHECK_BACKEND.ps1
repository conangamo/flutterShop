# Check Backend Status Script

Write-Host "=== BACKEND STATUS CHECK ===" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "1. Checking Docker..." -ForegroundColor Yellow
$dockerCheck = docker ps 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Docker is running" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Docker is not running" -ForegroundColor Red
    Write-Host "   Action: Start Docker Desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check containers
Write-Host "2. Checking containers..." -ForegroundColor Yellow
Set-Location native-e-commerce-be
$containers = docker compose ps --format json | ConvertFrom-Json

if ($containers) {
    foreach ($container in $containers) {
        $status = $container.State
        $name = $container.Service
        if ($status -eq "running") {
            Write-Host "   OK: $name is running" -ForegroundColor Green
        } else {
            Write-Host "   WARNING: $name is $status" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   WARNING: No containers found" -ForegroundColor Yellow
    Write-Host "   Action: Run 'docker compose up -d'" -ForegroundColor Cyan
}
Set-Location ..
Write-Host ""

# Check API endpoint
Write-Host "3. Checking API endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://192.168.104.173:8000/api/v1/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   OK: API is responding (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: API is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Possible causes:" -ForegroundColor Yellow
    Write-Host "   - Backend container not running" -ForegroundColor Gray
    Write-Host "   - Wrong IP address in .env" -ForegroundColor Gray
    Write-Host "   - Backend not started yet" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Action: Start backend" -ForegroundColor Cyan
    Write-Host "   cd native-e-commerce-be" -ForegroundColor Gray
    Write-Host "   docker compose up -d" -ForegroundColor Gray
}
Write-Host ""

# Check database
Write-Host "4. Checking database..." -ForegroundColor Yellow
$dbCheck = docker compose -f native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK: Database is accessible" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Cannot connect to database" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If backend is NOT running, start it:" -ForegroundColor Yellow
Write-Host "cd native-e-commerce-be" -ForegroundColor Gray
Write-Host "docker compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "Then apply the shoe seed data:" -ForegroundColor Yellow
Write-Host "cd database" -ForegroundColor Gray
Write-Host "powershell -ExecutionPolicy Bypass -File SIMPLE_FIX.ps1" -ForegroundColor Gray
Write-Host ""
