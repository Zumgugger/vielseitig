#!/bin/bash
# Activation script for development environment
# Source this in your terminal: source dev-setup.sh

# Activate virtual environment
source .venv/bin/activate

echo "✓ Virtual environment activated"
echo "Python: $(python --version)"
echo "Pip: $(pip --version)"
echo ""
echo "Ready to develop! 🚀"
