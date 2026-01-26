# Vielseitig Development Setup

## Prerequisites

- WSL (Ubuntu) installed on Windows
- Python 3.10+ installed in WSL
- VS Code with Remote - WSL extension

## Initial Setup

The workspace is configured to use WSL as the default terminal and a Python virtual environment (`.venv`).

### Quick Start

1. Open a new terminal in VS Code (it will automatically use WSL)
2. The virtual environment should auto-activate (look for `(.venv)` in the prompt)
3. If not activated automatically, run:
   ```bash
   source .venv/bin/activate
   ```

Alternatively, use the setup script:
```bash
source dev-setup.sh
```

### Manual Setup (if needed)

If you need to recreate the virtual environment:

```bash
# Create virtual environment
python3 -m venv .venv --without-pip

# Activate it
source .venv/bin/activate

# Install pip
curl -sS https://bootstrap.pypa.io/get-pip.py | python
```

## Installing Dependencies

Once the virtual environment is activated:

```bash
# Install requirements
pip install -r requirements.txt

# Or install packages individually
pip install flask sqlalchemy python-dotenv
```

## Verifying Setup

Check that everything is working:

```bash
python --version  # Should show Python 3.10+
pip --version     # Should point to .venv/lib/python3.10/site-packages/pip
which python      # Should point to .venv/bin/python
```

## Development Workflow

All Python commands should be run within the activated virtual environment:

```bash
# Activate venv (if not auto-activated)
source .venv/bin/activate

# Run your application
python app.py

# Install new packages
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

## VS Code Configuration

The workspace is pre-configured with:
- WSL as default terminal profile
- Python interpreter pointing to `.venv/bin/python`
- Auto-activation of virtual environment in terminals
- Auto-approval of WSL terminal commands for GitHub Copilot

## Troubleshooting

### Virtual environment not activating
```bash
source .venv/bin/activate
```

### Wrong Python version
Make sure you're in WSL, not PowerShell:
```bash
# Check current shell
echo $SHELL  # Should output something like /bin/bash
```

### Permission issues
Make the setup script executable:
```bash
chmod +x dev-setup.sh
```
