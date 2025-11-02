# Cinephile Central - Automated Deployment Script
# PowerShell script to build and deploy the application

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Cinephile Central - Deployment Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FunctionsDir = Join-Path $ProjectRoot "server\functions"
$ClientDir = Join-Path $ProjectRoot "client\cinephile-central"

# Check if Firebase Blaze plan is enabled
Write-Host "⚠️  IMPORTANT: Make sure you've upgraded to Firebase Blaze plan!" -ForegroundColor Yellow
Write-Host "   Visit: https://console.firebase.google.com/project/gen-lang-client-0239125682/usage/details" -ForegroundColor Yellow
Write-Host ""
$continue = Read-Host "Have you upgraded to Blaze plan? (y/n)"
if ($continue -ne "y") {
    Write-Host "❌ Deployment cancelled. Please upgrade to Blaze plan first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Installing/Updating Backend Dependencies..." -ForegroundColor Green
Write-Host "-----------------------------------------------" -ForegroundColor Gray
Set-Location $FunctionsDir
if (Test-Path "package-lock.json") {
    npm ci
}
else {
    npm install
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependency installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Installing Frontend Dependencies..." -ForegroundColor Green
Write-Host "-----------------------------------------------" -ForegroundColor Gray
Set-Location $ClientDir
if (Test-Path "package-lock.json") {
    npm ci
}
else {
    npm install
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependency installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Building Frontend..." -ForegroundColor Green
Write-Host "-----------------------------------------------" -ForegroundColor Gray
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend build complete" -ForegroundColor Green
Write-Host ""

# Verify build output exists
$DistDir = Join-Path $ClientDir "dist"
if (-not (Test-Path $DistDir)) {
    Write-Host "❌ Build directory not found at: $DistDir" -ForegroundColor Red
    exit 1
}

Write-Host "Step 4: Deploying to Firebase..." -ForegroundColor Green
Write-Host "-----------------------------------------------" -ForegroundColor Gray
Set-Location $ProjectRoot

Write-Host "Deploying all components (Functions, Hosting, Firestore Rules)..." -ForegroundColor Cyan
firebase deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Not logged in: Run 'firebase login'" -ForegroundColor Yellow
    Write-Host "  2. Not on Blaze plan: Upgrade at Firebase Console" -ForegroundColor Yellow
    Write-Host "  3. Insufficient permissions: Check Firebase project access" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your app is live at:" -ForegroundColor Cyan
Write-Host "   https://gen-lang-client-0239125682.web.app" -ForegroundColor White
Write-Host ""
Write-Host "📊 Firebase Console:" -ForegroundColor Cyan
Write-Host "   https://console.firebase.google.com/project/gen-lang-client-0239125682" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test the live application" -ForegroundColor White
Write-Host "   2. Create a test account and add reviews" -ForegroundColor White
Write-Host "   3. Monitor function logs: firebase functions:log" -ForegroundColor White
Write-Host "   4. Check usage in Firebase Console" -ForegroundColor White
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
