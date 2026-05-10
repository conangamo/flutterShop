#!/bin/bash
# Bash script to install dependencies and run sync_8_shoes_ai.py
# Usage: ./install_and_run.sh

set -e  # Exit on error

echo "============================================================"
echo "  Sync 8 Shoes AI - Installation & Execution"
echo "============================================================"
echo ""

# Check if Python is installed
echo "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
    echo "✅ Found: $(python3 --version)"
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
    echo "✅ Found: $(python --version)"
else
    echo "❌ Python not found! Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is available
echo "Checking pip..."
if command -v pip3 &> /dev/null; then
    PIP_CMD=pip3
    echo "✅ Found: $(pip3 --version)"
elif command -v pip &> /dev/null; then
    PIP_CMD=pip
    echo "✅ Found: $(pip --version)"
else
    echo "❌ pip not found! Please install pip first."
    exit 1
fi

# Install dependencies
echo ""
echo "Installing Python dependencies..."
echo "(This may take a few minutes on first run)"
echo ""

$PIP_CMD install -r requirements_sync_shoes.txt

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Run the script
echo "============================================================"
echo "  Running sync_8_shoes_ai.py"
echo "============================================================"
echo ""

$PYTHON_CMD sync_8_shoes_ai.py

echo ""
echo "============================================================"
echo "  ✨ All done!"
echo "============================================================"
echo ""
echo "📄 Output file: database/metadata_shoes.json"
echo "📖 For more info, see: SYNC_SHOES_README.md"
echo ""
