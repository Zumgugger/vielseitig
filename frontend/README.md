# Vielseitig Frontend

React + Vite + Tailwind CSS frontend for the Vielseitig adjective sorting application.

## Tech Stack

- **React 18** - UI library
- **Vite 4.5** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client

## Development

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:8000`

### Setup

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/          # Page components
│   │   ├── HomePage.jsx
│   │   ├── StudentSortPage.jsx
│   │   ├── UserLoginPage.jsx
│   │   ├── UserRegisterPage.jsx
│   │   └── AdminLoginPage.jsx
│   ├── components/     # Reusable components
│   ├── api/           # API client and service modules
│   │   ├── client.js  # Axios instance with interceptors
│   │   └── index.js   # API service functions
│   ├── hooks/         # Custom React hooks
│   ├── store/         # State management
│   ├── utils/         # Utility functions
│   ├── assets/        # Images, icons, fonts
│   ├── styles/        # Global styles
│   │   └── index.css  # Tailwind directives
│   ├── App.jsx        # Main app component with routes
│   └── main.jsx       # Entry point
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind configuration
└── package.json       # Dependencies and scripts
```

## API Configuration

The frontend is configured to proxy API requests to the backend:

- `/api/*` → `http://localhost:8000/api/*`
- `/admin/*` → `http://localhost:8000/admin/*`
- `/user/*` → `http://localhost:8000/user/*`
- `/l/*` → `http://localhost:8000/l/*`

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Available Routes

- `/` - Homepage with navigation
- `/sort` - Student sorting interface (default list)
- `/l/:token` - Student sorting interface (shared list)
- `/user/login` - Teacher login
- `/user/register` - Teacher registration
- `/admin/login` - Admin login

## Tailwind Utilities

The project includes custom Tailwind utilities:

### Buttons
```jsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn btn-outline">Outline Button</button>
```

### Cards
```jsx
<div className="card">
  Card content
</div>
```

### Form Elements
```jsx
<label className="label">Label</label>
<input className="input" />
```

## Color Palette

- Primary: `#667eea` (purple)
- Secondary: `#764ba2` (darker purple)

## Development Workflow

1. Backend API must be running (`make dev` in project root)
2. Start frontend dev server (`npm run dev` in frontend/)
3. Visit `http://localhost:3000`
4. Hot reload is enabled for instant updates

## Next Steps

See main project [TODO.md](../docs/todo.md) for implementation roadmap.

Current status: **Section 11 Complete** - Frontend foundation ready!
