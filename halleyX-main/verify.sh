#!/bin/bash
# HalleyX Dashboard Comprehensive Verification Script

echo "=================================="
echo " HalleyX Dashboard Verification"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Check Node.js
echo "1. Checking Node.js..."
node --version > /dev/null 2>&1
print_status $? "Node.js installed: $(node --version)"

# Check npm
echo ""
echo "2. Checking npm..."
npm --version > /dev/null 2>&1
print_status $? "npm installed: $(npm --version)"

# Check frontend dependencies
echo ""
echo "3. Checking frontend dependencies..."
if [ -d "node_modules" ]; then
    print_status 0 "Frontend node_modules found"
else
    echo -e "${YELLOW}!${NC} Frontend dependencies not installed"
    echo "  Run: npm install"
fi

# Check backend dependencies
echo ""
echo "4. Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    print_status 0 "Backend node_modules found"
else
    echo -e "${YELLOW}!${NC} Backend dependencies not installed"
    echo "  Run: cd backend && npm install"
fi

# Check required files
echo ""
echo "5. Checking required files..."
files=(
    "src/components/dashboard/ModernDashboard.tsx"
    "src/components/widgets/WidgetWrapper.tsx"
    "src/components/widgets/ChartWidgets.tsx"
    "src/components/widgets/AdvancedCharts.tsx"
    "src/api/orderApi.ts"
    "backend/index.js"
    "tailwind.config.ts"
    "vite.config.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "$file"
    else
        print_status 1 "$file"
    fi
done

# Check build configuration
echo ""
echo "6. Checking build configuration..."
npm run build > /dev/null 2>&1
if [ -d "dist" ]; then
    print_status 0 "Build successful: dist/ folder exists"
else
    print_status 1 "Build failed: dist/ folder not found"
fi

# Summary
echo ""
echo "=================================="
echo " Verification Complete"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend: npm run dev"
echo "3. Open: http://localhost:3000"
