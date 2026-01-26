# Vielseitig - Quick Reference

## ✅ Setup Complete!

Your development environment is ready:
- ✓ WSL (Ubuntu) as default terminal
- ✓ Python virtual environment (`.venv`)
- ✓ Git repository initialized
- ✓ VS Code configured for auto-activation

## 🚀 Start Developing

### Every time you start:
New VS Code terminals automatically:
- Use WSL (Ubuntu)
- Activate `.venv`
- Set working directory to project root

### Or manually:
```bash
source dev-setup.sh
```

## 📝 Common Commands

```bash
# Check environment
python --version    # Should show Python 3.10.12
pip --version      # Should point to .venv

# Install packages
pip install flask sqlalchemy
pip freeze > requirements.txt

# Git workflow
git status
git add .
git commit -m "message"

# Run application (when created)
python app.py
```

## 📂 Project Structure

```
vielseitig/
├── .venv/              # Virtual environment (auto-activated)
├── .vscode/            # VS Code settings
├── docs/               # Documentation
│   ├── blueprint.md    # Project blueprint
│   ├── spec.md         # Specification
│   └── todo.md         # Task list
├── .gitignore          # Git ignore rules
├── dev-setup.sh        # Environment activation script
├── DEV_SETUP.md        # Detailed setup guide
└── requirements.txt    # Python dependencies
```

## 🔧 Next Steps

From [todo.md](docs/todo.md):
1. Choose web framework (Flask or FastAPI)
2. Uncomment dependencies in requirements.txt
3. Install base dependencies: `pip install -r requirements.txt`
4. Start building the backend!

## 💡 Tips

- All Python commands run in `.venv` automatically
- WSL commands are auto-approved for quick execution
- Check [DEV_SETUP.md](DEV_SETUP.md) for troubleshooting

---

**Ready to build something awesome! 🎨**
