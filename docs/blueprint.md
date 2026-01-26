# Blueprint: "Ich bin" Adjektiv-Sortier-Tool

## Overview

This document outlines the step-by-step implementation plan for building the "Ich bin" adjective sorting tool, a web application that helps students (12-15 years) reflect on their personality through adjective sorting and hexagonal visualization.

---

## Phase 1: Foundation & Infrastructure

### Chunk 1.1: Project Setup & Development Environment

#### Step 1.1.1: Initialize Project Structure
- Create monorepo structure with backend and frontend directories
- Initialize Git repository with `.gitignore`
- Set up EditorConfig and Prettier for code consistency

#### Step 1.1.2: Backend Framework Setup
- Initialize Node.js/Express backend with TypeScript
- Configure TypeScript with strict mode
- Set up ESLint for backend
- Create basic health check endpoint

#### Step 1.1.3: Database Setup
- Install and configure better-sqlite3
- Create database connection module with connection pooling
- Implement database migration system
- Write first migration: create schema version table

#### Step 1.1.4: Frontend Framework Setup
- Initialize Vue 3 + Vite frontend with TypeScript
- Configure path aliases and build settings
- Set up ESLint and Prettier for frontend
- Create basic App shell component

#### Step 1.1.5: Docker Development Environment
- Create Dockerfile for backend
- Create Dockerfile for frontend (dev server)
- Create docker-compose.yml for local development
- Configure volume mounts for hot reload and database persistence

---

### Chunk 1.2: Database Schema & Seed Data

#### Step 1.2.1: Core Tables Migration
- Create `schools` table (id, name, status, created_at)
- Create `users` table (id, email, password_hash, school_id, status, active_until, created_at, last_login_at)
- Create `admins` table (id, username, password_hash, created_at, last_login_at)
- Add foreign key constraints and indexes

#### Step 1.2.2: Content Tables Migration
- Create `lists` table with all fields (id, name, description, is_default, owner_user_id, share_token, share_expires_at, share_enabled, share_with_school, source_list_id, created_at, updated_at)
- Create `adjectives` table (id, list_id, word, explanation, example, order_index, active)
- Add indexes for common queries

#### Step 1.2.3: Analytics Tables Migration
- Create `analytics_sessions` table (id/uuid, list_id, is_standard_list, theme_id, started_at, finished_at, pdf_exported_at)
- Create `analytics_assignments` table (id, session_id, adjective_id, bucket, assigned_at)
- Add indexes for aggregation queries

#### Step 1.2.4: Seed Data Implementation
- Implement idempotent seed runner
- Create seed for default adjective list (30 adjectives from spec)
- Create seed for default admin account (placeholder password)
- Write tests for seed idempotency

---

### Chunk 1.3: Backend API Foundation

#### Step 1.3.1: Error Handling & Logging
- Create custom error classes (NotFoundError, ValidationError, AuthError)
- Implement global error handler middleware
- Set up structured logging (pino)
- Write tests for error handling

#### Step 1.3.2: Request Validation
- Install and configure Zod for schema validation
- Create validation middleware
- Create reusable validation schemas
- Write tests for validation

#### Step 1.3.3: API Response Standards
- Define standard response envelope (success, data, error)
- Create response helper functions
- Implement pagination helper
- Write tests for response formatting

---

## Phase 2: Authentication & Authorization

### Chunk 2.1: Authentication Infrastructure

#### Step 2.1.1: Password Hashing
- Install argon2 for password hashing
- Create password service (hash, verify)
- Write comprehensive tests for password operations

#### Step 2.1.2: Session Management
- Install and configure express-session with SQLite store
- Create session configuration with 2-day sliding expiry
- Implement session middleware
- Write tests for session creation and expiry

#### Step 2.1.3: Admin Authentication
- Create POST `/api/admin/login` endpoint
- Create POST `/api/admin/logout` endpoint
- Create GET `/api/admin/me` endpoint
- Implement admin auth middleware
- Write integration tests

#### Step 2.1.4: User Authentication
- Create POST `/api/auth/login` endpoint (checks user status)
- Create POST `/api/auth/logout` endpoint
- Create GET `/api/auth/me` endpoint
- Implement user auth middleware with school-license check
- Write integration tests

---

### Chunk 2.2: User Registration Flow

#### Step 2.2.1: School Lookup API
- Create GET `/api/schools` endpoint (returns active schools for dropdown)
- Create POST `/api/schools` endpoint (create pending school)
- Write tests for school endpoints

#### Step 2.2.2: User Registration API
- Create POST `/api/auth/register` endpoint
- Validate email uniqueness
- Handle "new school" creation (pending)
- Set user status based on school license
- Write comprehensive tests

#### Step 2.2.3: Twilio SMS Integration
- Create Twilio service module
- Implement sendSms function with error handling
- Create notification service for registration alerts
- Write tests with Twilio API (real calls in integration tests)
- Add fallback logging on SMS failure

---

## Phase 3: Admin Backend

### Chunk 3.1: Admin User Management

#### Step 3.1.1: User CRUD API
- Create GET `/api/admin/users` (list with filters)
- Create GET `/api/admin/users/:id`
- Create PUT `/api/admin/users/:id` (update status, active_until)
- Create DELETE `/api/admin/users/:id`
- Write integration tests

#### Step 3.1.2: User Approval Workflow
- Create GET `/api/admin/users/pending` endpoint
- Create POST `/api/admin/users/:id/approve` endpoint
- Create POST `/api/admin/users/:id/reject` endpoint
- Write tests for approval flow

#### Step 3.1.3: Password Reset (Admin)
- Create POST `/api/admin/users/:id/reset-password` endpoint
- Generate temporary password or set specific password
- Write tests

---

### Chunk 3.2: Admin School Management

#### Step 3.2.1: School CRUD API
- Create GET `/api/admin/schools` (list with filters)
- Create GET `/api/admin/schools/:id`
- Create PUT `/api/admin/schools/:id` (update status)
- Write integration tests

#### Step 3.2.2: School Approval Workflow
- Create GET `/api/admin/schools/pending` endpoint
- Create POST `/api/admin/schools/:id/approve` endpoint
- Create POST `/api/admin/schools/:id/reject` endpoint
- Implement school license propagation (activate all users)
- Write tests for approval and license propagation

---

### Chunk 3.3: Admin Analytics Dashboard

#### Step 3.3.1: Analytics Aggregation Queries
- Implement total sessions count query
- Implement average duration query
- Implement top adjectives in "oft" bucket query
- Implement PDF exports count query
- Implement theme distribution query
- Write tests for each aggregation

#### Step 3.3.2: Analytics API
- Create GET `/api/admin/analytics/summary` endpoint
- Return all dashboard metrics
- Write integration tests

---

## Phase 4: User (Teacher) Backend

### Chunk 4.1: List Management API

#### Step 4.1.1: List CRUD
- Create GET `/api/lists` (own + school-shared + default)
- Create POST `/api/lists` (create custom list)
- Create PUT `/api/lists/:id` (update name, description, sharing)
- Create DELETE `/api/lists/:id`
- Write integration tests with auth

#### Step 4.1.2: List Sharing
- Implement share token generation (crypto random)
- Create POST `/api/lists/:id/share` (enable/disable, set expiry)
- Create GET `/api/lists/:id/share-info` (get link + QR data)
- Write tests for token generation and expiry

#### Step 4.1.3: Copy-on-Write (Fork)
- Create POST `/api/lists/:id/fork` endpoint
- Copy adjectives to new list
- Set source_list_id reference
- Enable school sharing by default on fork
- Write tests for fork behavior

---

### Chunk 4.2: Adjective Management API

#### Step 4.2.1: Adjective CRUD
- Create GET `/api/lists/:listId/adjectives`
- Create POST `/api/lists/:listId/adjectives`
- Create PUT `/api/adjectives/:id` (inline edit)
- Create DELETE `/api/adjectives/:id`
- Write integration tests

#### Step 4.2.2: Adjective Reordering
- Create PUT `/api/lists/:listId/adjectives/reorder`
- Update order_index for all affected adjectives
- Write tests for reorder logic

---

## Phase 5: Public API (Student Mode)

### Chunk 5.1: List Access API

#### Step 5.1.1: Default List Access
- Create GET `/api/public/lists/default`
- Return adjectives with random shuffle
- Write tests

#### Step 5.1.2: Shared List Access
- Create GET `/api/public/lists/:token`
- Validate token, expiry, owner status
- Return adjectives with random shuffle
- Return export_allowed flag
- Write tests for all validation cases

---

### Chunk 5.2: Analytics Event API

#### Step 5.2.1: Session Tracking
- Create POST `/api/public/analytics/session/start`
- Generate and return analytics_session_id
- Write tests

#### Step 5.2.2: Assignment Tracking
- Create POST `/api/public/analytics/assignment`
- Record adjective → bucket assignment
- Write tests

#### Step 5.2.3: Completion Tracking
- Create POST `/api/public/analytics/session/finish`
- Record finished_at timestamp
- Write tests

#### Step 5.2.4: Export Tracking
- Create POST `/api/public/analytics/session/export`
- Record pdf_exported_at timestamp
- Write tests

---

## Phase 6: Frontend Foundation

### Chunk 6.1: Frontend Infrastructure

#### Step 6.1.1: Routing Setup
- Install Vue Router
- Configure routes (public, auth, user, admin)
- Implement route guards for auth
- Write tests for route guards

#### Step 6.1.2: State Management
- Install Pinia
- Create auth store (login state, user info)
- Create session store (sorting progress, theme)
- Write tests for stores

#### Step 6.1.3: API Client
- Create axios instance with interceptors
- Implement request/response error handling
- Create typed API service modules
- Write tests for API client

#### Step 6.1.4: Theme System
- Define 6 color themes as CSS variables
- Create theme store with random default
- Implement theme switching
- Persist theme in localStorage
- Write tests for theme persistence

---

### Chunk 6.2: Shared Components

#### Step 6.2.1: UI Component Library Setup
- Create Button component (variants, sizes, disabled)
- Create Input component (validation states)
- Create Select/Dropdown component
- Write component tests

#### Step 6.2.2: Layout Components
- Create AppHeader component
- Create AppFooter component (Impressum, Datenschutz links)
- Create responsive container components
- Write component tests

#### Step 6.2.3: Feedback Components
- Create Toast/Notification component
- Create Loading spinner component
- Create auto-save status indicator ("Speichert…" → "Gespeichert")
- Write component tests

---

## Phase 7: Student Sorting Interface

### Chunk 7.1: Card Components

#### Step 7.1.1: Hexagon Card Component
- Create HexCard component with hexagonal shape
- Implement adjective display (word only default)
- Add tooltip trigger for explanation/example
- Style bold variant for "oft"
- Write component tests

#### Step 7.1.2: Card Interaction
- Implement explanation toggle (click/spacebar)
- Add keyboard focus handling
- Write interaction tests

---

### Chunk 7.2: Sorting Interface

#### Step 7.2.1: Bucket Components
- Create SortingBucket component (selten/manchmal/oft)
- Implement drop target styling
- Write component tests

#### Step 7.2.2: Active Card Area
- Create ActiveCard component (shows current adjective)
- Display progress indicator (e.g., "3/30")
- Implement "Eigenschaft erklären" button
- Write component tests

#### Step 7.2.3: Drag & Drop
- Implement drag from ActiveCard
- Implement drop to Bucket
- Add visual feedback during drag
- Write interaction tests

#### Step 7.2.4: Keyboard Controls
- Implement A/S/D for bucket assignment
- Implement arrow keys alternative
- Implement W/Up for undo
- Implement Spacebar for explanation toggle
- Write keyboard interaction tests

#### Step 7.2.5: Undo Functionality
- Implement undo stack in session store
- Create undo button component
- Limit to current session only
- Write tests for undo behavior

---

### Chunk 7.3: Session Persistence

#### Step 7.3.1: LocalStorage Integration
- Implement session save to localStorage
- Implement session restore on page load
- Include assignments, theme, hex layout
- Write tests for persistence

#### Step 7.3.2: Session Reset Logic
- Clear localStorage on new token/link
- Clear localStorage after PDF export
- Write tests for reset scenarios

---

## Phase 8: Hexagon Visualization

### Chunk 8.1: Hex Grid System

#### Step 8.1.1: Hex Coordinate System
- Implement axial coordinate system for hex grid
- Create functions for hex neighbors
- Create functions for ring iteration
- Write unit tests for coordinate math

#### Step 8.1.2: Random Placement Algorithm
- Implement "grow from center" placement for "oft"
- Implement continuation for "manchmal"
- Ensure random but connected layout
- Write tests for placement rules

#### Step 8.1.3: Layout Persistence
- Store hex positions in session state
- Implement "Anders anordnen" re-shuffle
- Preserve assignments, change only positions
- Write tests

---

### Chunk 8.2: Hex Visualization Component

#### Step 8.2.1: HexGrid Component
- Create SVG-based hex grid renderer
- Position hexagons based on axial coordinates
- Apply current theme colors
- Write component tests

#### Step 8.2.2: Center Card
- Render "Ich bin" card at center
- Style distinctively
- Write tests

#### Step 8.2.3: Live Preview
- Connect HexGrid to session store
- Update in real-time as cards are sorted
- Write integration tests

#### Step 8.2.4: Responsive Hex Display
- Scale grid to fit container
- Handle mobile collapsible state
- Implement collapse toggle button
- Write responsive tests

---

## Phase 9: Sorting Page Assembly

### Chunk 9.1: Desktop Layout

#### Step 9.1.1: Split Layout Component
- Create left panel (active card + buckets)
- Create right panel (hex preview + theme dropdown)
- Implement responsive breakpoint (900px)
- Write layout tests

#### Step 9.1.2: Shortcut Help Overlay
- Create overlay component for first visit
- Show keyboard shortcuts
- Collapse to "i" icon after dismissal
- Store dismissed state in localStorage
- Write component tests

---

### Chunk 9.2: Mobile Layout

#### Step 9.2.1: Stacked Layout
- Implement vertical stack: card → buckets → preview
- Move theme dropdown appropriately
- Write responsive tests

#### Step 9.2.2: Collapsible Preview
- Implement collapse/expand for hex preview
- Default to collapsed on mobile
- Preserve state during session
- Write interaction tests

---

### Chunk 9.3: Completion Flow

#### Step 9.3.1: Completion Detection
- Detect when all adjectives assigned
- Show confirmation modal
- "Fortfahren" button to proceed
- Write tests

#### Step 9.3.2: Result View Transition
- Navigate to result view on confirm
- Pass session state
- Disable back navigation
- Write navigation tests

---

## Phase 10: Result View & PDF Export

### Chunk 10.1: Result View

#### Step 10.1.1: Result Page Layout
- Display final hex visualization
- Show theme dropdown
- Show "Anders anordnen" button
- Responsive layout (split/stack)
- Write component tests

#### Step 10.1.2: PDF Button States
- Show PDF button
- Disable with tooltip for default list ("PDF nur mit Schul-Lizenz")
- Enable for valid custom list
- Write tests for button states

---

### Chunk 10.2: PDF Generation

#### Step 10.2.1: PDF Library Setup
- Install and configure jsPDF
- Create PDF service module
- Write basic PDF generation test

#### Step 10.2.2: Hex Grid to PDF
- Convert SVG hex grid to PDF graphics
- Apply theme colors
- Scale to fit A4 portrait
- Write visual regression tests

#### Step 10.2.3: PDF Content & Styling
- Add date footer (DD.MM.YYYY format)
- Apply bold styling for "oft" cards
- Set filename to "ich-bin-vielseitig.pdf"
- Write tests for PDF content

#### Step 10.2.4: Export Flow
- Implement download trigger
- Track export in analytics
- Clear localStorage after export
- Write integration tests

---

## Phase 11: User (Teacher) Frontend

### Chunk 11.1: Auth Pages

#### Step 11.1.1: Login Page
- Create combined Login/Register page
- Implement login form with validation
- Handle login errors
- Redirect to list overview on success
- Write tests

#### Step 11.1.2: Registration Form
- Implement registration form
- School dropdown with "Neue Schule" option
- Show pending status message after registration
- Write tests

---

### Chunk 11.2: List Management UI

#### Step 11.2.1: List Overview Page
- Display list cards (default + own + school-shared)
- Show list status badges
- Add "Neue Liste" button
- Write component tests

#### Step 11.2.2: List Card Component
- Show list name (inline editable)
- Show adjective count
- Show sharing status
- Edit/Delete actions
- Write component tests

#### Step 11.2.3: Create List Flow
- Modal or inline form for new list
- Auto-save on blur
- Write tests

#### Step 11.2.4: Delete List Confirmation
- Confirmation modal before delete
- Write tests

---

### Chunk 11.3: List Editor UI

#### Step 11.3.1: List Detail Page
- Inline editable list name and description
- List of adjective cards
- "Neues Adjektiv" button
- Write component tests

#### Step 11.3.2: Adjective Card Component
- Inline editable: word, explanation, example
- Delete button with confirmation
- Drag handle for reordering
- Write component tests

#### Step 11.3.3: Auto-Save Implementation
- Debounced save on field changes
- Status indicator (saving/saved/error)
- Retry on error
- Write tests for save states

#### Step 11.3.4: Adjective Reordering
- Implement drag-and-drop reorder
- Update order_index via API
- Write tests

---

### Chunk 11.4: Sharing UI

#### Step 11.4.1: Share Settings Panel
- Toggle share_enabled
- Set share_expires_at (date picker)
- Toggle school sharing
- Write component tests

#### Step 11.4.2: Share Link & QR Display
- Display shareable URL
- Copy to clipboard button
- Generate and display QR code (qrcode library)
- Write tests

---

## Phase 12: Admin Frontend

### Chunk 12.1: Admin Auth

#### Step 12.1.1: Admin Login Page
- Separate login page for admin
- Redirect to admin dashboard
- Write tests

---

### Chunk 12.2: Admin Dashboard

#### Step 12.2.1: Dashboard Page
- Display analytics summary cards
- Total sessions, avg duration, PDF exports
- Top adjectives in "oft"
- Theme distribution chart
- Write component tests

---

### Chunk 12.3: Admin User Management UI

#### Step 12.3.1: Pending Users Page
- List pending user registrations
- Approve/Reject buttons per user
- Show associated school (pending or active)
- Write component tests

#### Step 12.3.2: User List Page
- Filterable table of all users
- Status badges (pending/active/passive)
- Inline status toggle
- Write tests

#### Step 12.3.3: User Detail/Edit
- View user details
- Edit status, active_until
- Reset password button
- Write tests

---

### Chunk 12.4: Admin School Management UI

#### Step 12.4.1: Pending Schools Page
- List pending school registrations
- Approve/Reject buttons
- Write tests

#### Step 12.4.2: School List Page
- Filterable table of all schools
- Status badges
- User count per school
- Write tests

---

## Phase 13: Static Pages & Legal

### Chunk 13.1: Footer Links

#### Step 13.1.1: Impressum Page
- Create static page route
- Placeholder content (to be provided)
- Write tests for routing

#### Step 13.1.2: Datenschutzerklärung Page
- Create static page route
- Placeholder content
- Write tests

---

## Phase 14: Deployment & Production

### Chunk 14.1: Production Build

#### Step 14.1.1: Frontend Production Build
- Configure Vite for production
- Optimize bundle size
- Generate source maps
- Write build verification tests

#### Step 14.1.2: Backend Production Configuration
- Environment variable handling
- Production logging configuration
- Security headers (helmet)
- Write configuration tests

---

### Chunk 14.2: Docker Production Setup

#### Step 14.2.1: Production Dockerfiles
- Multi-stage build for backend
- Nginx-based frontend container
- Write Dockerfile tests

#### Step 14.2.2: Docker Compose Production
- Production docker-compose.yml
- Volume for SQLite persistence
- Environment variable configuration
- Health checks

#### Step 14.2.3: Apache Reverse Proxy Config
- Create Apache VirtualHost configuration
- HTTPS with Let's Encrypt
- Proxy to Docker containers
- Document deployment steps

---

### Chunk 14.3: Initial Data Setup

#### Step 14.3.1: Production Seed Script
- Run migrations on first deploy
- Seed default adjective list
- Create initial admin account
- Document admin password change process

---

## Phase 15: Final Polish & Testing

### Chunk 15.1: Accessibility

#### Step 15.1.1: Keyboard Navigation Audit
- Test all interactive elements
- Ensure focus visible
- Write accessibility tests

#### Step 15.1.2: Reduced Motion
- Respect prefers-reduced-motion
- Disable animations when set
- Write tests

#### Step 15.1.3: Contrast & Readability
- Verify color contrast ratios
- Test font sizes
- Document findings

---

### Chunk 15.2: End-to-End Testing

#### Step 15.2.1: E2E Test Setup
- Install Playwright
- Configure test environment
- Create test utilities

#### Step 15.2.2: Student Flow E2E Tests
- Complete sorting flow
- PDF export (mocked)
- Session persistence
- Write comprehensive tests

#### Step 15.2.3: User Flow E2E Tests
- Registration and login
- List management
- Sharing flow
- Write comprehensive tests

#### Step 15.2.4: Admin Flow E2E Tests
- User approval
- School management
- Analytics dashboard
- Write comprehensive tests

---

# Implementation Prompts for GitHub Copilot

Below are the prompts to be used sequentially with GitHub Copilot to implement each step in a test-driven manner.

---

## Prompt 1: Project Structure Initialization

```
Create the initial project structure for a full-stack TypeScript web application with the following requirements:

1. Create a monorepo structure with /backend and /frontend directories
2. Initialize a Git repository with a comprehensive .gitignore for Node.js, TypeScript, and IDE files
3. Create .editorconfig with:
   - UTF-8 encoding
   - LF line endings
   - 2-space indentation for JS/TS/JSON/YAML
   - Trim trailing whitespace
4. Create a root package.json with workspace configuration for npm workspaces
5. Add a README.md with project title "Ich bin - Adjektiv-Sortier-Tool" and placeholder sections

Do not install dependencies yet. Just create the folder structure and configuration files.
```

---

## Prompt 2: Backend Framework Setup

```
Set up the backend Express application with TypeScript. Working in the /backend directory:

1. Initialize package.json with:
   - name: "@vielseitig/backend"
   - Scripts: dev, build, start, test, lint
   
2. Install dependencies:
   - express, cors, helmet
   - typescript, ts-node-dev, @types/node, @types/express, @types/cors
   
3. Create tsconfig.json with:
   - Strict mode enabled
   - ES2022 target
   - Node16 module resolution
   - outDir: ./dist
   - rootDir: ./src
   
4. Create src/index.ts with:
   - Basic Express app on port from env or 3000
   - CORS and JSON middleware
   - Helmet for security headers
   - GET /health endpoint returning { status: 'ok', timestamp }
   
5. Create src/config/index.ts for environment configuration

6. Set up ESLint with TypeScript support

Write a test file tests/health.test.ts using vitest that:
- Tests the /health endpoint returns 200
- Tests the response contains status: 'ok'
```

---

## Prompt 3: Database Connection Setup

```
Set up SQLite database connection for the backend using better-sqlite3. 

1. Install dependencies:
   - better-sqlite3
   - @types/better-sqlite3
   
2. Create src/db/connection.ts:
   - Export a function getDb() that returns a singleton database instance
   - Database file path from env DB_PATH or './data/vielseitig.db'
   - Enable WAL mode for better concurrency
   - Enable foreign keys
   
3. Create src/db/migrations/index.ts:
   - Implement a simple migration runner
   - Track applied migrations in a _migrations table
   - Migrations are numbered files (001_initial.ts, 002_users.ts, etc.)
   - Runner applies migrations in order, skips already applied
   
4. Create src/db/migrations/001_schema_version.ts:
   - Creates the _migrations table if not exists
   
5. Create a script in package.json: "migrate": "ts-node src/db/migrate.ts"

6. Create src/db/migrate.ts that runs all pending migrations

Write tests in tests/db/migrations.test.ts:
- Test that migrations run idempotently
- Test that migration table tracks applied migrations
- Use in-memory SQLite for tests
```

---

## Prompt 4: Core Database Schema

```
Create the core database schema migrations. Build on the existing migration system.

Create src/db/migrations/002_core_tables.ts with the following tables:

1. schools table:
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - name: TEXT NOT NULL UNIQUE
   - status: TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active'))
   - created_at: TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

2. users table:
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - email: TEXT NOT NULL UNIQUE (case-insensitive)
   - password_hash: TEXT NOT NULL
   - school_id: INTEGER NOT NULL REFERENCES schools(id)
   - status: TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'passive'))
   - active_until: TEXT (nullable, ISO date)
   - created_at: TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
   - last_login_at: TEXT (nullable)

3. admins table:
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - username: TEXT NOT NULL UNIQUE
   - password_hash: TEXT NOT NULL
   - created_at: TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
   - last_login_at: TEXT (nullable)

Add appropriate indexes for:
- users.email (unique, case-insensitive with COLLATE NOCASE)
- users.school_id
- users.status

Write tests that verify:
- All tables are created
- Constraints work (try inserting invalid status)
- Foreign key constraint works
```

---

## Prompt 5: Content Tables Schema

```
Create the content tables migration for lists and adjectives.

Create src/db/migrations/003_content_tables.ts:

1. lists table:
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - name: TEXT NOT NULL
   - description: TEXT (nullable)
   - is_default: INTEGER NOT NULL DEFAULT 0 (boolean)
   - owner_user_id: INTEGER REFERENCES users(id) ON DELETE CASCADE (nullable for default list)
   - share_token: TEXT UNIQUE (nullable)
   - share_expires_at: TEXT (nullable, ISO datetime)
   - share_enabled: INTEGER NOT NULL DEFAULT 0 (boolean)
   - share_with_school: INTEGER NOT NULL DEFAULT 0 (boolean)
   - source_list_id: INTEGER REFERENCES lists(id) ON DELETE SET NULL (nullable)
   - created_at: TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
   - updated_at: TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

2. adjectives table:
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - list_id: INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE
   - word: TEXT NOT NULL
   - explanation: TEXT NOT NULL
   - example: TEXT NOT NULL
   - order_index: INTEGER NOT NULL DEFAULT 0
   - active: INTEGER NOT NULL DEFAULT 1 (boolean)
   - created_at: TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
   - updated_at: TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

Add indexes:
- lists.owner_user_id
- lists.share_token (unique)
- lists.is_default
- adjectives.list_id
- adjectives.list_id + order_index

Add trigger to update updated_at on UPDATE for both tables.

Write tests verifying:
- Tables created correctly
- Cascade delete works (delete list → deletes adjectives)
- Default values work
```

---

## Prompt 6: Analytics Tables Schema

```
Create the analytics tables migration.

Create src/db/migrations/004_analytics_tables.ts:

1. analytics_sessions table:
   - id: TEXT PRIMARY KEY (UUID)
   - list_id: INTEGER REFERENCES lists(id) ON DELETE SET NULL (nullable)
   - is_standard_list: INTEGER NOT NULL (boolean)
   - theme_id: TEXT NOT NULL
   - started_at: TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
   - finished_at: TEXT (nullable)
   - pdf_exported_at: TEXT (nullable)

2. analytics_assignments table:
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - session_id: TEXT NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE
   - adjective_id: INTEGER NOT NULL REFERENCES adjectives(id) ON DELETE CASCADE
   - bucket: TEXT NOT NULL CHECK (bucket IN ('selten', 'manchmal', 'oft'))
   - assigned_at: TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

Add indexes:
- analytics_sessions.started_at (for date range queries)
- analytics_sessions.is_standard_list
- analytics_assignments.session_id
- analytics_assignments.bucket
- analytics_assignments.adjective_id

Write tests verifying:
- Tables created with correct constraints
- Bucket CHECK constraint works
- CASCADE delete works
```

---

## Prompt 7: Seed System and Default Adjectives

```
Implement the seed system with the default 30 adjectives from the spec.

1. Create src/db/seeds/index.ts:
   - Implement SeedRunner that tracks seeds in _seeds table
   - Seeds are idempotent (check before insert)
   - Export runSeeds() function

2. Create src/db/seeds/001_default_adjectives.ts:
   - Insert the default list with is_default=true, name="Standardliste"
   - Insert all 30 adjectives from the spec with their explanations and examples:
   
   The adjectives are (word | explanation | example):
   1. zuverlässig | Du machst, was du versprochen hast. | Wenn ich sage, ich bringe etwas mit, dann mache ich das auch.
   2. teamfähig | Du kannst gut mit anderen zusammenarbeiten. | In Gruppenarbeiten höre ich zu und mache meinen Teil.
   3. hilfsbereit | Du unterstützt andere, wenn sie Hilfe brauchen. | Wenn jemand etwas nicht versteht, erkläre ich es ruhig.
   ... (include all 30 from spec section 5.2.2)
   
   - Set order_index sequentially

3. Create src/db/seeds/002_default_admin.ts:
   - Insert admin with username 'admin'
   - Password hash for 'CHANGE_ME_IMMEDIATELY' (document this!)
   - Log warning that password must be changed

4. Add script "seed": "ts-node src/db/seed.ts"
5. Create src/db/seed.ts that runs migrations then seeds

Write tests:
- Seeds run successfully
- Seeds are idempotent (run twice, same result)
- Default list has exactly 30 adjectives
- Default admin exists
```

---

## Prompt 8: Error Handling Infrastructure

```
Create comprehensive error handling for the backend API.

1. Create src/errors/index.ts with custom error classes:
   - AppError (base class with statusCode, code, isOperational)
   - NotFoundError (404)
   - ValidationError (400, supports field errors)
   - AuthenticationError (401)
   - AuthorizationError (403)
   - ConflictError (409)

2. Create src/middleware/errorHandler.ts:
   - Global error handler middleware
   - Log errors with structured format
   - Return consistent JSON response: { success: false, error: { code, message, details? } }
   - Don't leak stack traces in production
   - Handle unknown errors gracefully

3. Create src/utils/asyncHandler.ts:
   - Wrapper to catch async errors and pass to error handler
   - Usage: router.get('/path', asyncHandler(async (req, res) => {...}))

4. Create src/middleware/notFound.ts:
   - 404 handler for undefined routes

5. Install pino and pino-pretty for logging
6. Create src/utils/logger.ts:
   - Configure pino logger
   - Pretty print in development
   - JSON in production

Update src/index.ts to use error handlers.

Write tests in tests/errors.test.ts:
- Each error type returns correct status code
- Error handler formats response correctly
- Unknown errors return 500
- Async errors are caught
```

---

## Prompt 9: Request Validation with Zod

```
Set up request validation using Zod.

1. Install zod

2. Create src/middleware/validate.ts:
   - Middleware factory that takes Zod schemas for body, query, params
   - Validates request parts against schemas
   - Throws ValidationError with field details on failure
   - Attaches validated/typed data to req.validated

3. Create src/validation/common.ts with reusable schemas:
   - emailSchema (valid email, lowercase transform)
   - passwordSchema (min 8 chars)
   - idParamSchema (positive integer)
   - paginationSchema (page, limit with defaults)
   - dateSchema (ISO date string)

4. Create src/validation/auth.ts:
   - loginSchema: { email, password }
   - registerSchema: { email, password, schoolId?, newSchoolName? }

5. Create TypeScript types from schemas using z.infer

Write tests in tests/validation.test.ts:
- Valid data passes validation
- Invalid email rejected with proper error
- Missing required fields rejected
- Type inference works correctly
```

---

## Prompt 10: API Response Helpers

```
Create standardized API response helpers.

1. Create src/utils/response.ts:
   
   - success<T>(res, data: T, statusCode = 200)
     Returns: { success: true, data: T }
   
   - created<T>(res, data: T)
     Returns 201 with success response
   
   - noContent(res)
     Returns 204 with no body
   
   - paginated<T>(res, data: T[], pagination: { page, limit, total })
     Returns: { success: true, data: T[], pagination: { page, limit, total, totalPages } }

2. Update error handler to use consistent error format:
   { success: false, error: { code: string, message: string, details?: object } }

3. Create src/types/express.d.ts:
   - Extend Express Request type with validated property
   - Type the response methods

Write tests:
- success() returns correct format
- paginated() calculates totalPages correctly
- Types are correctly inferred
```

---

## Prompt 11: Password Service

```
Create the password hashing service using argon2.

1. Install argon2

2. Create src/services/password.ts:
   
   - hash(password: string): Promise<string>
     Uses argon2id with recommended settings:
     - memoryCost: 65536 (64 MB)
     - timeCost: 3
     - parallelism: 4
   
   - verify(password: string, hash: string): Promise<boolean>
     Returns true if password matches hash
     Returns false on mismatch (doesn't throw)
   
   - needsRehash(hash: string): Promise<boolean>
     Checks if hash was made with outdated settings

3. Create src/config/security.ts:
   - Export argon2 options
   - Export session configuration

Write comprehensive tests in tests/services/password.test.ts:
- Hash produces different output each time (salted)
- Verify returns true for correct password
- Verify returns false for incorrect password
- Hash format is valid argon2id
- Timing attack resistance (constant-time comparison built into argon2)
```

---

## Prompt 12: Session Management

```
Set up session management with SQLite store.

1. Install:
   - express-session
   - @types/express-session
   - better-sqlite3-session-store

2. Create src/middleware/session.ts:
   - Configure session middleware with:
     - Secret from env SESSION_SECRET
     - SQLite store (sessions table)
     - Cookie settings: httpOnly, secure in production, sameSite: 'lax'
     - maxAge: 2 days (172800000 ms)
     - Rolling: true (sliding expiration)
   
3. Create src/db/migrations/005_sessions_table.ts:
   - Create sessions table for the store
   - Add index on expiry for cleanup

4. Extend express-session types in src/types/session.d.ts:
   - Add userId?: number
   - Add adminId?: number
   - Add userEmail?: string
   - Add isAdmin?: boolean

5. Create session helper functions in src/utils/session.ts:
   - setUserSession(req, user)
   - setAdminSession(req, admin)
   - clearSession(req): Promise<void>
   - isAuthenticated(req): boolean
   - isAdmin(req): boolean

Write tests:
- Session is created on login
- Session data persists across requests
- Session expires after configured time
- Clear session removes all data
```

---

## Prompt 13: Admin Authentication Endpoints

```
Implement admin authentication endpoints.

1. Create src/repositories/adminRepository.ts:
   - findByUsername(username: string): Admin | undefined
   - updateLastLogin(id: number): void
   - Interface Admin { id, username, password_hash, created_at, last_login_at }

2. Create src/services/adminAuthService.ts:
   - login(username: string, password: string): Promise<Admin>
     Throws AuthenticationError if invalid
     Updates last_login_at on success

3. Create src/routes/admin/auth.ts:
   - POST /api/admin/login
     Body: { username, password }
     Response: { success: true, data: { id, username } }
     Sets admin session
   
   - POST /api/admin/logout
     Clears session
     Response: { success: true }
   
   - GET /api/admin/me
     Requires admin session
     Response: { success: true, data: { id, username } }

4. Create src/middleware/adminAuth.ts:
   - requireAdmin middleware
   - Checks session.adminId exists
   - Throws AuthenticationError if not

5. Register routes in src/routes/index.ts

Write integration tests in tests/routes/admin/auth.test.ts:
- Login with valid credentials succeeds
- Login with invalid credentials returns 401
- /me returns admin info when logged in
- /me returns 401 when not logged in
- Logout clears session
```

---

## Prompt 14: User Authentication Endpoints

```
Implement user (teacher) authentication endpoints.

1. Create src/repositories/userRepository.ts:
   - findByEmail(email: string): User | undefined
   - findById(id: number): User | undefined
   - create(data: CreateUserData): User
   - updateLastLogin(id: number): void
   - updateStatus(id: number, status: string, activeUntil?: string): void
   - Interface User { id, email, password_hash, school_id, status, active_until, created_at, last_login_at }

2. Create src/repositories/schoolRepository.ts:
   - findById(id: number): School | undefined
   - findByName(name: string): School | undefined
   - findAll(status?: string): School[]
   - create(name: string): School
   - isLicensed(schoolId: number): boolean (has at least one active user)
   - Interface School { id, name, status, created_at }

3. Create src/services/userAuthService.ts:
   - login(email: string, password: string): Promise<User>
     Checks user exists
     Checks password
     Checks status is 'active' (or school is licensed)
     Checks active_until not passed
     Throws AuthenticationError with appropriate message
     Updates last_login_at

4. Create src/routes/auth.ts:
   - POST /api/auth/login
     Body: { email, password }
     Response: { success: true, data: { id, email, schoolId, schoolName } }
   
   - POST /api/auth/logout
     Clears session
   
   - GET /api/auth/me
     Requires user session
     Response includes user and school info

5. Create src/middleware/userAuth.ts:
   - requireUser middleware
   - requireActiveUser middleware (checks status + active_until + school license)

Write integration tests:
- Login succeeds for active user
- Login fails for pending user
- Login fails for passive user
- Login fails when active_until has passed
- Login succeeds for passive user if school is licensed
- Session is properly set
```

---

## Prompt 15: User Registration Endpoint

```
Implement user registration with school selection/creation.

1. Create src/validation/auth.ts (extend):
   - registerSchema:
     - email: valid email, unique
     - password: min 8 chars
     - schoolId: optional positive integer (existing school)
     - newSchoolName: optional string (create new school)
     - Exactly one of schoolId or newSchoolName required

2. Create src/services/registrationService.ts:
   - register(data: RegisterData): Promise<{ user: User, school: School, isNewSchool: boolean }>
     - If schoolId provided, verify school exists and is active
     - If newSchoolName provided, create school with status 'pending'
     - Create user with status based on school license:
       - If school is licensed → status 'active'
       - Else → status 'pending'
     - Return created user and school

3. Create POST /api/auth/register endpoint:
   - Validate input
   - Call registrationService.register()
   - Response: { success: true, data: { message: 'Registrierung eingereicht. Bitte warten Sie auf Freischaltung.' } }
   - Don't auto-login (user is pending)

4. Create GET /api/schools endpoint (public):
   - Returns active schools for dropdown
   - Response: { success: true, data: schools[] }

Write tests:
- Register with existing school creates pending user
- Register with new school creates pending school and pending user
- Register with licensed school creates active user
- Duplicate email returns 409 Conflict
- Invalid school ID returns 404
- Email is stored lowercase
```

---

## Prompt 16: Twilio SMS Integration

```
Implement Twilio SMS notification for new registrations.

1. Install twilio

2. Create src/config/twilio.ts:
   - Export config from env vars:
     - TWILIO_ACCOUNT_SID
     - TWILIO_AUTH_TOKEN
     - TWILIO_FROM_NUMBER
     - ADMIN_PHONE_NUMBER
   - Export isConfigured() to check if all vars are set

3. Create src/services/smsService.ts:
   - Initialize Twilio client
   - sendSms(to: string, body: string): Promise<{ success: boolean, messageId?: string, error?: string }>
   - Handle errors gracefully (log but don't throw)

4. Create src/services/notificationService.ts:
   - notifyNewRegistration(): Promise<void>
     - Sends SMS: "neue registrierung bei vielseitig"
     - Logs on success
     - Logs warning on failure (doesn't throw)

5. Update registrationService.register():
   - After successful registration, call notificationService.notifyNewRegistration()
   - Don't let SMS failure affect registration response

6. Create src/services/__mocks__/smsService.ts for testing

Write tests:
- SMS is sent on registration (use Twilio test credentials)
- Registration succeeds even if SMS fails
- SMS contains correct message
- Notification only sent once per registration

For integration test with real Twilio:
- Use Twilio test credentials from environment
- Verify message is queued (don't actually send to real number)
```

---

## Prompt 17: Admin User Management API

```
Implement admin endpoints for user management.

1. Extend userRepository.ts:
   - findAll(filters?: { status?, schoolId? }): User[]
   - findPending(): User[]
   - delete(id: number): void
   - Count users by school

2. Create src/routes/admin/users.ts:
   
   - GET /api/admin/users
     Query: { status?, schoolId?, page?, limit? }
     Response: paginated users with school info
   
   - GET /api/admin/users/pending
     Response: pending users with school info
   
   - GET /api/admin/users/:id
     Response: user with school info
   
   - PUT /api/admin/users/:id
     Body: { status?, activeUntil?, notes? }
     Response: updated user
   
   - POST /api/admin/users/:id/approve
     Sets status to 'active'
     Response: updated user
   
   - POST /api/admin/users/:id/reject
     Deletes the user
     Response: { success: true }
   
   - POST /api/admin/users/:id/reset-password
     Body: { newPassword }
     Response: { success: true }
   
   - DELETE /api/admin/users/:id
     Response: { success: true }

3. All routes require admin authentication

Write integration tests:
- List users returns all users
- Filter by status works
- Approve changes status to active
- Reset password allows new login
- Delete removes user
- Non-admin cannot access
```

---

## Prompt 18: Admin School Management API

```
Implement admin endpoints for school management.

1. Extend schoolRepository.ts:
   - findAll(filters?: { status? }): School[]
   - findPending(): School[]
   - updateStatus(id: number, status: string): void
   - delete(id: number): void
   - getUserCount(schoolId: number): number

2. Create src/services/schoolLicenseService.ts:
   - activateSchool(schoolId: number): void
     - Set school status to 'active'
     - Set all users of this school to 'active' (school license propagation)
   - deactivateSchool(schoolId: number): void
     - Set school status to 'pending'
     - Set all users to 'passive' (optional behavior, TBD)

3. Create src/routes/admin/schools.ts:
   
   - GET /api/admin/schools
     Query: { status?, page?, limit? }
     Response: paginated schools with user count
   
   - GET /api/admin/schools/pending
     Response: pending schools
   
   - GET /api/admin/schools/:id
     Response: school with user count
   
   - PUT /api/admin/schools/:id
     Body: { status }
     Response: updated school
   
   - POST /api/admin/schools/:id/approve
     Uses schoolLicenseService.activateSchool()
     Response: updated school
   
   - POST /api/admin/schools/:id/reject
     Deletes school (cascade deletes users)
     Response: { success: true }

Write integration tests:
- List schools with counts
- Approve school activates all its users
- Reject school deletes it and its users
- Non-admin cannot access
```

---

## Prompt 19: Admin Analytics API

```
Implement analytics aggregation and API for admin dashboard.

1. Create src/repositories/analyticsRepository.ts:
   - getTotalSessions(): number
   - getAverageDuration(): number (in seconds, finished sessions only)
   - getTopAdjectives(bucket: string, limit: number): { word: string, count: number }[]
   - getPdfExportsCount(): number
   - getThemeDistribution(): { themeId: string, count: number }[]
   - getSessionsInDateRange(from: string, to: string): number

2. Create src/services/analyticsService.ts:
   - getDashboardSummary(): DashboardSummary
     Returns: {
       totalSessions: number,
       averageDurationSeconds: number,
       topOftenAdjectives: { word: string, count: number }[],
       pdfExports: number,
       themeDistribution: { themeId: string, count: number }[]
     }

3. Create src/routes/admin/analytics.ts:
   - GET /api/admin/analytics/summary
     Response: { success: true, data: DashboardSummary }

4. Requires admin authentication

Write tests:
- Summary returns correct structure
- Calculations are accurate with test data
- Empty data returns zeros/empty arrays
- Non-admin cannot access
```

---

## Prompt 20: User List Management API

```
Implement list CRUD endpoints for users (teachers).

1. Create src/repositories/listRepository.ts:
   - findById(id: number): List | undefined
   - findByToken(token: string): List | undefined
   - findByUserId(userId: number): List[]
   - findSchoolShared(schoolId: number): List[]
   - findDefault(): List | undefined
   - create(data: CreateListData): List
   - update(id: number, data: UpdateListData): List
   - delete(id: number): void
   - generateShareToken(): string (crypto random, URL-safe)

2. Create src/services/listService.ts:
   - getListsForUser(userId: number, schoolId: number): List[]
     Returns: default list + own lists + school-shared lists
   - createList(userId: number, data: CreateListData): List
   - updateList(listId: number, userId: number, data: UpdateListData): List
     Checks ownership
   - deleteList(listId: number, userId: number): void
     Checks ownership, prevents deleting default

3. Create src/routes/lists.ts:
   
   - GET /api/lists
     Returns user's accessible lists
   
   - POST /api/lists
     Body: { name, description? }
     Creates new custom list
   
   - PUT /api/lists/:id
     Body: { name?, description?, shareWithSchool? }
     Updates list (owner only)
   
   - DELETE /api/lists/:id
     Deletes list (owner only)

4. Requires user authentication

Write integration tests:
- User sees default + own + school-shared lists
- Create list sets correct owner
- Update only works for owner
- Cannot delete default list
- School-shared lists visible to school members
```

---

## Prompt 21: List Sharing API

```
Implement list sharing functionality with tokens.

1. Install crypto (built-in) for secure token generation

2. Extend listRepository.ts:
   - updateSharing(id: number, data: { shareEnabled, shareExpiresAt?, shareToken? }): List
   - isShareValid(list: List): boolean
     Checks: shareEnabled && token exists && not expired && owner active

3. Create src/services/shareService.ts:
   - enableSharing(listId: number, userId: number, expiresAt?: string): ShareInfo
     Generates token if not exists
     Sets shareEnabled = true
     Returns: { token, url, expiresAt }
   
   - disableSharing(listId: number, userId: number): void
     Sets shareEnabled = false (keeps token for re-enable)
   
   - getShareInfo(listId: number, userId: number): ShareInfo | null
     Returns current sharing info
   
   - updateExpiry(listId: number, userId: number, expiresAt: string): ShareInfo

4. Create src/routes/lists.ts (extend):
   
   - POST /api/lists/:id/share
     Body: { enabled: boolean, expiresAt?: string }
     Response: { success: true, data: ShareInfo }
   
   - GET /api/lists/:id/share-info
     Response: { success: true, data: ShareInfo | null }

5. ShareInfo type: { token, url, expiresAt, enabled }
   URL format: https://vielseitig.zumgugger.ch/l/{token}

Write tests:
- Enable sharing generates token
- Disable preserves token
- Token is URL-safe and hard to guess (24+ chars)
- Share info includes full URL
- Expiry is respected
```

---

## Prompt 22: List Fork (Copy-on-Write) API

```
Implement fork functionality for school-shared lists.

1. Extend listRepository.ts:
   - fork(sourceListId: number, newOwnerId: number): List
     Creates copy of list with all adjectives
     Sets source_list_id to original
     Sets owner_user_id to new owner
     Sets share_with_school = true (default for forks)
     Copies all adjectives with new list_id

2. Create src/services/forkService.ts:
   - canFork(list: List, userId: number): boolean
     Can fork if: list is school-shared AND user is in same school AND user is not owner
   
   - forkList(listId: number, userId: number): List
     Validates user can fork
     Creates the fork
     Returns new list

3. Create src/routes/lists.ts (extend):
   - POST /api/lists/:id/fork
     Response: { success: true, data: newList }
     Validates user is in same school
     Creates fork

Write tests:
- Fork creates new list with same adjectives
- Fork sets source_list_id
- Fork defaults to school-shared
- Cannot fork own list
- Cannot fork list from different school
- Original list unchanged after fork
```

---

## Prompt 23: Adjective CRUD API

```
Implement adjective management endpoints.

1. Create src/repositories/adjectiveRepository.ts:
   - findById(id: number): Adjective | undefined
   - findByListId(listId: number): Adjective[]
   - create(listId: number, data: CreateAdjectiveData): Adjective
   - update(id: number, data: UpdateAdjectiveData): Adjective
   - delete(id: number): void
   - reorder(listId: number, orderedIds: number[]): void
   - getNextOrderIndex(listId: number): number

2. Create src/validation/adjectives.ts:
   - createAdjectiveSchema: { word, explanation, example }
   - updateAdjectiveSchema: { word?, explanation?, example?, active? }
   - reorderSchema: { orderedIds: number[] }

3. Create src/routes/adjectives.ts:
   
   - GET /api/lists/:listId/adjectives
     Returns adjectives sorted by order_index
   
   - POST /api/lists/:listId/adjectives
     Creates new adjective at end
   
   - PUT /api/adjectives/:id
     Updates adjective (checks list ownership)
   
   - DELETE /api/adjectives/:id
     Deletes adjective (checks list ownership)
   
   - PUT /api/lists/:listId/adjectives/reorder
     Body: { orderedIds: number[] }
     Updates order_index for all

4. Ownership check: user must own the list (or be admin editing default list)

Write tests:
- CRUD operations work correctly
- Order is maintained
- Reorder updates all indices
- Cannot edit adjectives in lists user doesn't own
- Can edit default list adjectives as admin
```

---

## Prompt 24: Public List Access API

```
Implement public endpoints for student access to lists.

1. Create src/services/publicListService.ts:
   - getDefaultList(): { list: List, adjectives: Adjective[] }
     Returns default list with adjectives
     Shuffles adjectives randomly
   
   - getListByToken(token: string): { list: List, adjectives: Adjective[], exportAllowed: boolean } | null
     Validates token is valid:
       - share_enabled = true
       - share_expires_at in future or null
       - owner user is active (or school is licensed)
     Returns null if invalid
     Shuffles adjectives randomly
     exportAllowed based on owner status

2. Create src/routes/public.ts:
   
   - GET /api/public/lists/default
     Response: {
       success: true,
       data: {
         list: { id, name },
         adjectives: shuffled array,
         exportAllowed: false (always false for default)
       }
     }
   
   - GET /api/public/lists/:token
     Response: same structure, exportAllowed based on owner
     Returns 404 if token invalid/expired

3. No authentication required

Write tests:
- Default list returns shuffled adjectives
- Token access returns correct list
- Expired token returns 404
- Disabled share returns 404
- Inactive owner returns 404 (unless school licensed)
- Export flag correct for each case
```

---

## Prompt 25: Analytics Event Tracking API

```
Implement analytics event tracking for student sessions.

1. Install uuid for session ID generation

2. Create src/repositories/analyticsRepository.ts (extend):
   - createSession(data: CreateSessionData): AnalyticsSession
   - updateSession(id: string, data: UpdateSessionData): void
   - addAssignment(sessionId: string, adjectiveId: number, bucket: string): void
   - deleteAssignmentsForSession(sessionId: string): void

3. Create src/services/analyticsTrackingService.ts:
   - startSession(listId: number | null, isStandardList: boolean, themeId: string): string
     Creates session, returns session ID (UUID)
   
   - recordAssignment(sessionId: string, adjectiveId: number, bucket: string): void
     Records assignment
   
   - finishSession(sessionId: string): void
     Sets finished_at
   
   - recordExport(sessionId: string): void
     Sets pdf_exported_at

4. Create src/routes/public.ts (extend):
   
   - POST /api/public/analytics/session/start
     Body: { listId?, isStandardList, themeId }
     Response: { success: true, data: { sessionId } }
   
   - POST /api/public/analytics/assignment
     Body: { sessionId, adjectiveId, bucket }
     Response: { success: true }
   
   - POST /api/public/analytics/session/finish
     Body: { sessionId }
     Response: { success: true }
   
   - POST /api/public/analytics/session/export
     Body: { sessionId }
     Response: { success: true }

5. No authentication required (public)

Write tests:
- Session is created with UUID
- Assignments are recorded
- Finish sets timestamp
- Export sets timestamp
- Invalid session ID handled gracefully
```

---

## Prompt 26: Frontend Project Setup

```
Set up the Vue 3 frontend with Vite and TypeScript.

Working in /frontend directory:

1. Initialize with Vite:
   - Vue 3 with TypeScript
   - Package name: @vielseitig/frontend

2. Install dependencies:
   - vue-router@4
   - pinia
   - axios
   - @vueuse/core

3. Configure:
   - tsconfig.json with strict mode and path aliases (@/ → src/)
   - vite.config.ts with proxy to backend (localhost:3000)
   - ESLint + Prettier

4. Create directory structure:
   - src/assets/ (styles)
   - src/components/ (shared components)
   - src/composables/ (Vue composables)
   - src/layouts/ (layout components)
   - src/pages/ (page components)
   - src/router/ (routing)
   - src/stores/ (Pinia stores)
   - src/services/ (API services)
   - src/types/ (TypeScript types)

5. Create src/main.ts:
   - Initialize Vue app
   - Install Pinia
   - Install Router
   - Mount app

6. Create src/App.vue:
   - RouterView with suspense
   - Basic error boundary

7. Set up Vitest for component testing

Write a simple test that the App component mounts.
```

---

## Prompt 27: Frontend Routing Setup

```
Set up Vue Router with route guards.

1. Create src/router/index.ts:
   - Define routes:
     - / → SortingPage (public, default list)
     - /l/:token → SortingPage (public, custom list)
     - /result → ResultPage (public)
     - /login → LoginPage (guest only)
     - /register → RegisterPage (guest only)
     - /dashboard → UserDashboard (requires user auth)
     - /lists → ListsPage (requires user auth)
     - /lists/:id → ListEditPage (requires user auth)
     - /admin → AdminDashboard (requires admin auth)
     - /admin/users → AdminUsersPage
     - /admin/schools → AdminSchoolsPage
     - /impressum → ImpressumPage
     - /datenschutz → DatenschutzPage
   - Lazy load all pages
   - Export router instance

2. Create src/router/guards.ts:
   - requireAuth: redirects to /login if not authenticated
   - requireAdmin: redirects to /admin/login if not admin
   - guestOnly: redirects to /dashboard if already logged in

3. Create src/types/router.ts:
   - Define route meta types

4. Create placeholder page components:
   - src/pages/SortingPage.vue
   - src/pages/ResultPage.vue
   - src/pages/LoginPage.vue
   - etc. (just render route name for now)

Write tests:
- Routes resolve to correct components
- Guards redirect appropriately
- Lazy loading works
```

---

## Prompt 28: Frontend State Management

```
Set up Pinia stores for application state.

1. Create src/stores/auth.ts:
   - State: { user, admin, isAuthenticated, isAdmin, loading }
   - Actions:
     - login(email, password)
     - adminLogin(username, password)
     - logout()
     - fetchCurrentUser()
   - Getters: isAuthenticated, isAdmin, userSchoolId

2. Create src/stores/session.ts (for sorting session):
   - State: {
       listId, listToken, adjectives, assignments (Map<id, bucket>),
       currentIndex, undoStack, theme, hexLayout, analyticsSessionId
     }
   - Actions:
     - initSession(listData)
     - assignToBucket(adjectiveId, bucket)
     - undo()
     - setTheme(themeId)
     - reshuffleHexLayout()
     - clearSession()
   - Getters:
     - currentAdjective
     - progress (assigned/total)
     - isComplete
     - assignments by bucket (selten, manchmal, oft)
   - Persist to localStorage

3. Create src/stores/themes.ts:
   - State: { themes, currentThemeId }
   - Define 6 hardcoded themes with colors
   - Actions: setRandomTheme(), setTheme(id)
   - Getters: currentTheme

4. Each store should use localStorage persistence for relevant state

Write tests:
- Auth store handles login/logout
- Session store tracks assignments correctly
- Undo works
- LocalStorage persistence works
- Theme random selection works
```

---

## Prompt 29: Frontend API Client

```
Create typed API client services.

1. Create src/services/api.ts:
   - Configure axios instance with baseURL
   - Add request interceptor for auth headers (from session)
   - Add response interceptor for error handling
   - Export typed request methods

2. Create src/services/authApi.ts:
   - login(email, password): Promise<User>
   - adminLogin(username, password): Promise<Admin>
   - logout(): Promise<void>
   - register(data): Promise<{ message: string }>
   - getCurrentUser(): Promise<User | null>
   - getCurrentAdmin(): Promise<Admin | null>

3. Create src/services/publicApi.ts:
   - getDefaultList(): Promise<ListWithAdjectives>
   - getListByToken(token): Promise<ListWithAdjectives>
   - startSession(data): Promise<{ sessionId: string }>
   - recordAssignment(data): Promise<void>
   - finishSession(sessionId): Promise<void>
   - recordExport(sessionId): Promise<void>

4. Create src/services/listsApi.ts:
   - getLists(): Promise<List[]>
   - createList(data): Promise<List>
   - updateList(id, data): Promise<List>
   - deleteList(id): Promise<void>
   - getShareInfo(id): Promise<ShareInfo>
   - updateSharing(id, data): Promise<ShareInfo>
   - forkList(id): Promise<List>

5. Create src/types/api.ts:
   - Define all response types
   - Define request payload types

Write tests:
- API methods call correct endpoints
- Error handling works
- Types are correct
```

---

## Prompt 30: Theme System Implementation

```
Implement the 6-color theme system for the UI.

1. Create src/styles/themes.ts:
   Define 6 themes, each with:
   - id: string (e.g., 'ocean', 'forest', 'sunset', 'lavender', 'mint', 'coral')
   - name: string (display name in German)
   - colors: {
       background: string,
       surface: string,
       primary: string,
       secondary: string,
       text: string,
       textMuted: string,
       hexFill: string,
       hexBorder: string,
       hexText: string,
       hexBoldFill: string,
       hexBoldText: string
     }

2. Create src/styles/variables.css:
   - Define CSS custom properties for all theme colors
   - Default to first theme

3. Create src/composables/useTheme.ts:
   - Access theme store
   - Provide computed theme colors
   - Apply theme to document (set CSS variables)
   - Watch theme changes and update

4. Update src/App.vue:
   - Use useTheme composable
   - Apply theme on mount

5. Create ThemeSelector.vue component:
   - Dropdown with 6 theme options
   - Shows color preview swatches
   - Updates theme store on selection

Write tests:
- All 6 themes have required properties
- Theme switching updates CSS variables
- Random theme selection works
- Theme persists in localStorage
```

---

## Prompt 31: Core UI Components

```
Create the core reusable UI components.

1. Create src/components/ui/Button.vue:
   - Props: variant (primary/secondary/ghost), size (sm/md/lg), disabled, loading
   - Slots: default, icon
   - Emits: click
   - Styled with theme colors

2. Create src/components/ui/Input.vue:
   - Props: type, modelValue, label, error, placeholder, disabled
   - Emits: update:modelValue
   - Shows error state styling

3. Create src/components/ui/Select.vue:
   - Props: options, modelValue, label, placeholder
   - Emits: update:modelValue
   - Styled dropdown

4. Create src/components/ui/Modal.vue:
   - Props: open, title, size
   - Emits: close
   - Slots: default, footer
   - Click outside to close
   - Escape key to close
   - Focus trap

5. Create src/components/ui/Toast.vue:
   - Props: message, type (success/error/info), duration
   - Auto-dismiss
   - Create useToast composable for programmatic usage

6. Create src/components/ui/Spinner.vue:
   - Props: size
   - Animated loading spinner

7. Create src/components/ui/AutoSaveStatus.vue:
   - Props: status ('idle' | 'saving' | 'saved' | 'error')
   - Shows "Speichert…" / "Gespeichert" / error message

Write component tests for each:
- Renders correctly
- Props work
- Events emit correctly
- Accessibility (keyboard, ARIA)
```

---

## Prompt 32: Layout Components

```
Create layout components for the application.

1. Create src/components/layout/AppHeader.vue:
   - Logo/title: "Ich bin vielseitig"
   - Theme selector (right side)
   - Login link when not authenticated
   - User menu (dropdown) when authenticated:
     - Dashboard link
     - Logout button
   - Different header for admin

2. Create src/components/layout/AppFooter.vue:
   - Links: Impressum, Datenschutzerklärung
   - Small, subtle design
   - Fixed at bottom or after content

3. Create src/components/layout/PublicLayout.vue:
   - Header with theme selector and login link
   - Main content area (slot)
   - Footer

4. Create src/components/layout/AuthLayout.vue:
   - Header with user/logout
   - Sidebar navigation (for user pages)
   - Main content area
   - Footer

5. Create src/components/layout/AdminLayout.vue:
   - Admin-specific header
   - Admin sidebar navigation
   - Main content area

6. Update router to use layouts:
   - Public routes use PublicLayout
   - User routes use AuthLayout
   - Admin routes use AdminLayout

Write component tests:
- Layout renders children in slot
- Header shows correct auth state
- Footer links work
```

---

## Prompt 33: Hexagon Card Component

```
Create the hexagonal card component for adjectives.

1. Create src/components/hex/HexCard.vue:
   - Props: 
     - word: string
     - explanation?: string
     - example?: string
     - bold: boolean (for "oft" items)
     - size: 'sm' | 'md' | 'lg'
     - showTooltip: boolean
   - Render hexagonal shape using CSS clip-path or SVG
   - Display word centered
   - Bold styling when bold=true
   - Theme colors from current theme

2. Create src/components/hex/HexCardTooltip.vue:
   - Props: explanation, example, visible
   - Shows explanation and example
   - Positioned above/below card
   - Animated show/hide

3. Create src/composables/useHexCard.ts:
   - Manage tooltip state
   - Handle keyboard (spacebar toggle)
   - Handle hover
   - Handle click (for touch)

4. Style the hexagon:
   - Use CSS clip-path: polygon for hexagon shape
   - Or SVG path for more control
   - Responsive sizing
   - Hover effects (subtle)
   - Focus visible state for keyboard

5. CSS for hexagon shape (flat-top orientation):
   ```css
   clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
   ```

Write component tests:
- Renders word correctly
- Bold styling applies
- Tooltip shows on hover
- Tooltip toggles on spacebar
- Theme colors apply
```

---

## Prompt 34: Sorting Bucket Component

```
Create the bucket component for sorting.

1. Create src/components/sorting/SortingBucket.vue:
   - Props:
     - bucket: 'selten' | 'manchmal' | 'oft'
     - label: string
     - isDropTarget: boolean
     - isHighlighted: boolean
   - Display bucket label
   - Visual drop target area
   - Highlight when dragging over
   - Keyboard shortcut hint (A/S/D)

2. Styling:
   - Large, clear target area
   - Distinct colors for each bucket (from theme)
   - Active/hover state for drag feedback
   - Accessible contrast

3. Create src/components/sorting/BucketRow.vue:
   - Contains 3 SortingBucket components
   - Horizontal layout on desktop
   - Handles drop events
   - Emits: drop(bucket)

4. Implement drag-and-drop:
   - Use native HTML5 drag and drop
   - Or use @vueuse/core useDraggable
   - Highlight valid drop targets during drag

Write component tests:
- Buckets render with correct labels
- Highlight on drag over
- Drop event emits correct bucket
- Keyboard hints display
```

---

## Prompt 35: Active Card Area Component

```
Create the active card sorting area.

1. Create src/components/sorting/ActiveCardArea.vue:
   - Props:
     - adjective: Adjective (current)
     - progress: { current: number, total: number }
   - Display current adjective as HexCard (large)
   - Progress indicator: "3/30"
   - "Eigenschaft erklären" button
   - Draggable card

2. Create src/components/sorting/ExplanationPanel.vue:
   - Props: explanation, example, visible
   - Animated slide-in panel
   - Close button
   - Styled card with explanation and example

3. Create src/composables/useSorting.ts:
   - Keyboard handling:
     - A/Left → assign to 'selten'
     - S/Down → assign to 'manchmal'  
     - D/Right → assign to 'oft'
     - W/Up → undo
     - Space → toggle explanation
   - Drag and drop handling
   - Connect to session store

4. Implement keyboard shortcuts:
   - Listen on window/document
   - Prevent when focused in input
   - Show visual feedback on keypress

5. Accessibility:
   - Announce current card to screen readers
   - Announce assignment confirmation
   - Focus management

Write component tests:
- Shows current adjective
- Progress updates
- Keyboard shortcuts work
- Explanation toggles
- Drag starts correctly
```

---

## Prompt 36: Undo Functionality

```
Implement undo functionality for sorting.

1. Update src/stores/session.ts:
   - Add undoStack: Array<{ adjectiveId, previousBucket: string | null }>
   - On assign: push to undo stack
   - On undo: pop from stack, restore previous state
   - Limit stack size (e.g., 50 items)
   - Clear stack on session reset

2. Create src/components/sorting/UndoButton.vue:
   - Props: disabled (when stack empty)
   - Click handler calls undo
   - Keyboard shortcut hint (W)
   - Icon + text: "Rückgängig"

3. Undo logic in session store:
   ```typescript
   undo() {
     const last = this.undoStack.pop()
     if (!last) return
     
     // Remove from current bucket
     this.assignments.delete(last.adjectiveId)
     
     // Move current index back
     this.currentIndex--
     
     // Trigger hex layout update if needed
   }
   ```

4. Visual feedback:
   - Brief animation when undoing
   - Toast notification (optional)

Write tests:
- Undo removes last assignment
- Undo decrements current index
- Cannot undo when stack empty
- Multiple undos work correctly
- Stack respects size limit
```

---

## Prompt 37: Session Persistence

```
Implement localStorage persistence for sorting session.

1. Create src/composables/useSessionPersistence.ts:
   - Save session state to localStorage on changes
   - Debounce saves (500ms)
   - Restore session on page load
   - Key format: 'vielseitig_session'
   - Handle corrupted data gracefully

2. Session data to persist:
   ```typescript
   interface PersistedSession {
     listId: number | null
     listToken: string | null
     adjectives: Adjective[]
     assignments: Record<number, string>
     currentIndex: number
     theme: string
     hexLayout: HexPosition[]
     analyticsSessionId: string
     startedAt: string
   }
   ```

3. Update session store:
   - Initialize from localStorage if exists
   - Save on every state change (debounced)
   - Clear localStorage after PDF export
   - Clear when new token/link opened

4. Create src/composables/useSessionReset.ts:
   - Detect new list token in URL
   - Compare with stored token
   - If different: clear and start fresh
   - No warning dialog (per spec)

5. Handle edge cases:
   - Corrupted JSON → clear and start fresh
   - Incomplete data → clear and start fresh
   - Version mismatch (future) → migrate or clear

Write tests:
- Session saves to localStorage
- Session restores on refresh
- New token clears old session
- Corrupted data handled gracefully
- Clear after export works
```

---

## Prompt 38: Hex Grid Coordinate System

```
Implement the hexagonal grid coordinate system.

1. Create src/utils/hexGrid.ts:
   
   Axial coordinate system (q, r):
   - Center at (0, 0)
   - Flat-top hexagon orientation
   
   Functions:
   - hexNeighbors(q, r): Array<{q, r}> — returns 6 neighbor coordinates
   - hexRing(center, radius): Array<{q, r}> — returns all hexes at distance
   - hexDistance(a, b): number — distance between two hexes
   - axialToPixel(q, r, size): {x, y} — convert to pixel position
   - pixelToAxial(x, y, size): {q, r} — convert from pixel (for hit testing)

2. Create src/utils/hexLayout.ts:
   
   Random layout algorithm:
   - placeHexagons(oftItems, manchmalItems): HexPosition[]
   
   Algorithm for "oft":
   1. Start with center (reserved for "Ich bin")
   2. For each "oft" item:
      - Get all occupied positions
      - Find all free adjacent positions
      - Pick one at random
      - Place item there
   
   Algorithm for "manchmal":
   - Continue from where "oft" ended
   - Same rules: random adjacent to existing
   
   Result: Array<{ q, r, adjectiveId, bucket }>

3. Create types:
   ```typescript
   interface HexPosition {
     q: number
     r: number
     adjectiveId: number | null // null for center
     bucket: 'center' | 'oft' | 'manchmal'
   }
   ```

Write comprehensive unit tests:
- Neighbor calculation correct
- Ring calculation correct
- Distance calculation correct
- Layout produces connected graph
- All items placed
- Center is reserved
```

---

## Prompt 39: Hex Grid Visualization Component

```
Create the SVG-based hex grid visualization.

1. Create src/components/hex/HexGrid.vue:
   - Props:
     - positions: HexPosition[]
     - size: number (hex size in pixels)
     - showLabels: boolean
   - Computed:
     - SVG viewBox based on positions
     - Pixel positions for each hex
   - Render:
     - SVG container
     - Hexagon for each position
     - Text label for each (adjective word)

2. Create src/components/hex/HexGridItem.vue:
   - Props: position, word, bucket, size
   - Render single hexagon SVG path
   - Apply theme colors
   - Bold text for "oft" items
   - Special style for center ("Ich bin")

3. SVG hexagon path (flat-top):
   ```typescript
   function hexPath(cx, cy, size) {
     const angles = [0, 60, 120, 180, 240, 300].map(a => a * Math.PI / 180)
     const points = angles.map(a => ({
       x: cx + size * Math.cos(a),
       y: cy + size * Math.sin(a)
     }))
     return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`
   }
   ```

4. Responsive scaling:
   - Calculate bounds of all hexagons
   - Fit within container
   - Maintain aspect ratio

5. Styling:
   - Theme colors for fill/stroke
   - Font sizing based on hex size
   - Hover effect (optional)

Write component tests:
- Renders correct number of hexagons
- Center hex has "Ich bin" text
- "oft" items are bold
- Colors match theme
```

---

## Prompt 40: Live Hex Preview

```
Connect the hex grid to show live preview during sorting.

1. Create src/components/sorting/LiveHexPreview.vue:
   - Uses session store
   - Computes hex positions from assignments
   - Renders HexGrid
   - Updates in real-time as items are sorted

2. Update session store:
   - Add hexLayout state
   - Recalculate layout when assignments change
   - Add reshuffleLayout() action

3. Create src/composables/useHexLayout.ts:
   - Watch assignments changes
   - Incrementally add new items to layout
   - Maintain existing positions (don't reshuffle on each add)
   - Only reshuffle on explicit action

4. Incremental layout update:
   ```typescript
   function addToLayout(existing: HexPosition[], newItem: {id, bucket}) {
     if (bucket === 'selten') return existing // Don't add
     
     const occupied = new Set(existing.map(p => `${p.q},${p.r}`))
     const adjacents = getAdjacentPositions(existing)
     const free = adjacents.filter(p => !occupied.has(`${p.q},${p.r}`))
     
     if (free.length === 0) {
       // Expand to next ring
       free.push(...getNextRingPositions(existing))
     }
     
     const chosen = free[Math.floor(Math.random() * free.length)]
     return [...existing, { ...chosen, adjectiveId: newItem.id, bucket: newItem.bucket }]
   }
   ```

5. Undo handling:
   - When undoing, remove last added hex
   - Maintain layout consistency

Write tests:
- Live preview updates on assignment
- Undo removes hex from preview
- Layout stays consistent
- "selten" items don't appear
```

---

## Prompt 41: Sorting Page Desktop Layout

```
Assemble the complete sorting page with desktop layout.

1. Create src/pages/SortingPage.vue:
   - Load list data (default or by token)
   - Initialize session
   - Start analytics session
   - Two-column layout on desktop

2. Create src/components/sorting/SortingLayout.vue:
   - Props: isMobile: boolean
   - Left panel (or top on mobile):
     - ActiveCardArea
     - BucketRow
   - Right panel (or bottom on mobile):
     - LiveHexPreview
     - ThemeSelector
   - Responsive breakpoint: 900px

3. Create src/composables/useSortingPage.ts:
   - Load list based on route (default or :token)
   - Handle loading/error states
   - Initialize session store
   - Start analytics tracking
   - Handle completion detection

4. Desktop layout CSS:
   ```css
   .sorting-layout {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 2rem;
     min-height: calc(100vh - header - footer);
   }
   
   @media (max-width: 900px) {
     .sorting-layout {
       grid-template-columns: 1fr;
     }
   }
   ```

5. Error handling:
   - Invalid token → show error message
   - Network error → retry option

Write integration tests:
- Page loads default list
- Page loads custom list by token
- Layout switches at breakpoint
- Session initialized correctly
```

---

## Prompt 42: Shortcut Help Overlay

```
Implement the keyboard shortcut help overlay.

1. Create src/components/sorting/ShortcutHelp.vue:
   - Shows overlay on first visit
   - Lists keyboard shortcuts:
     - A / ← : selten
     - S / ↓ : manchmal
     - D / → : oft
     - W / ↑ : Rückgängig
     - Leertaste : Erklärung
   - "Verstanden" button to dismiss
   - Collapses to small "i" icon after dismiss

2. Create src/composables/useShortcutHelp.ts:
   - Track if help has been shown (localStorage)
   - showHelp state
   - Show overlay if not dismissed before
   - Hover on "i" shows help again

3. ShortcutHelpIcon.vue:
   - Small info icon
   - Hover tooltip with shortcuts
   - Click opens full overlay

4. Styling:
   - Semi-transparent overlay
   - Centered card with shortcuts
   - Clean, readable layout
   - Matches theme

5. localStorage key: 'vielseitig_shortcuts_dismissed'

Write component tests:
- Shows on first visit
- Dismiss hides and saves preference
- Icon hover shows tooltip
- Not shown on subsequent visits
```

---

## Prompt 43: Mobile Sorting Layout

```
Implement the mobile/responsive sorting layout.

1. Update src/components/sorting/SortingLayout.vue:
   - Detect mobile with useMediaQuery (900px breakpoint)
   - Stack layout: card → buckets → preview
   - Smaller bucket targets for touch

2. Create src/components/sorting/CollapsiblePreview.vue:
   - Wraps LiveHexPreview
   - Toggle button: "Vorschau anzeigen" / "Vorschau ausblenden"
   - Collapsed by default on mobile
   - Smooth expand/collapse animation
   - Persists state in session

3. Mobile-specific adjustments:
   - Larger touch targets for buckets
   - Swipe gestures (optional, nice-to-have):
     - Swipe left → selten
     - Swipe down → manchmal
     - Swipe right → oft
   - Tap on bucket also works

4. CSS for mobile:
   ```css
   .sorting-layout--mobile {
     display: flex;
     flex-direction: column;
     gap: 1rem;
     padding: 1rem;
   }
   
   .bucket-row--mobile {
     display: flex;
     justify-content: space-between;
   }
   ```

5. Test on various screen sizes:
   - iPhone SE (375px)
   - Standard mobile (390px)
   - Tablet (768px)
   - Chromebook (1366px)

Write component tests:
- Layout stacks on mobile
- Preview collapses/expands
- Touch targets are large enough
- Swipe gestures work (if implemented)
```

---

## Prompt 44: Completion Flow

```
Implement the sorting completion detection and confirmation.

1. Create src/components/sorting/CompletionModal.vue:
   - Shows when all adjectives assigned
   - Message: "Fortfahren, falls du mit der Zuordnung zufrieden bist."
   - Button: "Fortfahren"
   - No cancel/back option (per spec)

2. Update session store:
   - Add computed isComplete
   - Track completion shown state

3. Update SortingPage.vue:
   - Watch isComplete
   - Show CompletionModal when complete
   - Navigate to /result on confirm

4. Navigation to result:
   - Pass session data via store (already in localStorage)
   - No query params needed
   - Prevent back navigation (replace history)

5. Create src/composables/useCompletion.ts:
   - Handle completion detection
   - Trigger analytics finish event
   - Navigate to result

6. UX flow:
   - Last assignment triggers completion check
   - Modal appears
   - User confirms
   - Navigate to result (history.replace)
   - Back button does NOT return to sorting

Write tests:
- Modal shows when all assigned
- Navigation works
- Analytics finish called
- Cannot go back to sorting
```

---

## Prompt 45: Result Page

```
Create the result page with final visualization.

1. Create src/pages/ResultPage.vue:
   - Display final hex visualization
   - Full-width/centered hex grid
   - Theme selector
   - "Anders anordnen" button
   - PDF export button (conditional)

2. Result page layout:
   - Responsive: desktop split, mobile stack
   - Desktop: larger hex visualization
   - Mobile: full-width, scrollable if needed

3. Create src/components/result/ResultActions.vue:
   - "Anders anordnen" button → reshuffles layout
   - Theme dropdown
   - PDF button (see export rules)

4. PDF button states:
   - If exportAllowed: enabled, triggers PDF generation
   - If not exportAllowed: disabled with tooltip
   - Tooltip: "PDF nur mit Schul-Lizenz"

5. "Anders anordnen" functionality:
   - Calls reshuffleLayout() in session store
   - Keeps assignments, only changes positions
   - Smooth animation (if reduced motion allows)

6. Prevent accidental leave:
   - No "are you sure?" dialogs (per spec)
   - But no back navigation to sorting

Write component tests:
- Displays correct hex layout
- Theme change works
- Reshuffle changes positions
- PDF button state correct
- No back navigation
```

---

## Prompt 46: PDF Generation Setup

```
Set up PDF generation with jsPDF.

1. Install jspdf

2. Create src/services/pdfService.ts:
   - generatePdf(data: PdfData): Promise<Blob>
   - PdfData: { hexLayout, theme, adjectives, date }

3. PDF layout (A4 portrait):
   - Page size: 210mm x 297mm
   - Margins: 20mm
   - Hex grid centered
   - Date in footer (format: DD.MM.YYYY)

4. Create src/utils/hexToPdf.ts:
   - Convert hex layout to PDF coordinates
   - Scale to fit page
   - Draw hexagons with fill/stroke
   - Draw text labels

5. PDF styling:
   - Apply theme colors
   - Bold text for "oft" items
   - Center "Ich bin" styled distinctly
   - Clean, professional appearance

6. Date formatting:
   ```typescript
   function formatDate(date: Date): string {
     return date.toLocaleDateString('de-CH', {
       day: '2-digit',
       month: '2-digit', 
       year: 'numeric'
     })
   }
   ```

Write tests:
- PDF generates without error
- Contains correct number of hexagons
- Date formatted correctly
- File size reasonable
```

---

## Prompt 47: PDF Export Flow

```
Implement the complete PDF export flow.

1. Create src/composables/usePdfExport.ts:
   - Generate PDF from current state
   - Trigger download
   - Track in analytics
   - Clear session after export

2. Export flow:
   ```typescript
   async function exportPdf() {
     // 1. Generate PDF
     const pdf = await pdfService.generatePdf({
       hexLayout: sessionStore.hexLayout,
       theme: themeStore.currentTheme,
       adjectives: sessionStore.adjectives,
       date: new Date()
     })
     
     // 2. Download
     const url = URL.createObjectURL(pdf)
     const a = document.createElement('a')
     a.href = url
     a.download = 'ich-bin-vielseitig.pdf'
     a.click()
     URL.revokeObjectURL(url)
     
     // 3. Track export
     await publicApi.recordExport(sessionStore.analyticsSessionId)
     
     // 4. Clear session
     sessionStore.clearSession()
   }
   ```

3. Update ResultPage.vue:
   - PDF button calls usePdfExport
   - Show loading state during generation
   - Handle errors gracefully

4. After export:
   - Session cleared from localStorage
   - User can start fresh (scan QR again)
   - No redirect needed

5. Error handling:
   - PDF generation fail → show error toast
   - Analytics fail → log but don't block
   - Download fail → show retry option

Write integration tests:
- PDF downloads successfully
- Filename is correct
- Analytics tracked
- Session cleared after export
```

---

## Prompt 48: Login Page

```
Create the combined login/register page for teachers.

1. Create src/pages/LoginPage.vue:
   - Two tabs/sections: "Anmelden" and "Registrieren"
   - Clean, simple form design
   - Error handling
   - Redirect to /dashboard on success

2. Create src/components/auth/LoginForm.vue:
   - Email input
   - Password input
   - Submit button
   - Error messages
   - Loading state

3. Create src/components/auth/RegisterForm.vue:
   - Email input
   - Password input (with confirmation)
   - School dropdown (existing schools)
   - "Neue Schule hinzufügen" option
   - New school name input (conditional)
   - Submit button
   - Success message about pending status

4. School dropdown logic:
   - Fetch active schools on mount
   - Last option: "Neue Schule hinzufügen"
   - If selected, show text input for school name

5. Registration success:
   - Show message: "Registrierung eingereicht. Bitte warten Sie auf Freischaltung."
   - Don't auto-login
   - Optional: switch to login tab

6. Validation:
   - Email format
   - Password min 8 chars
   - Password confirmation matches
   - School selection required

Write component tests:
- Login form submits correctly
- Registration form handles school selection
- New school input appears when selected
- Validation errors display
- Success states work
```

---

## Prompt 49: User Dashboard and List Overview

```
Create the user dashboard with list management.

1. Create src/pages/UserDashboard.vue:
   - Welcome message with user email
   - Quick stats (optional): number of lists, shares
   - Link to lists page
   - Logout button

2. Create src/pages/ListsPage.vue:
   - List of user's accessible lists
   - Categories: "Standardliste", "Meine Listen", "Geteilte Listen (Schule)"
   - "Neue Liste" button
   - Each list card clickable

3. Create src/components/lists/ListCard.vue:
   - Props: list
   - Display: name, adjective count, sharing status
   - Actions: Edit (link), Delete (with confirmation)
   - Share icon if shared
   - School icon if school-shared

4. Create list modal/inline form:
   - Name input
   - Description input (optional)
   - Create button
   - Auto-save after creation

5. Delete confirmation:
   - Modal: "Liste wirklich löschen?"
   - Cannot delete default list (hide delete button)

6. Load data:
   ```typescript
   const { data: lists, isLoading, error } = useQuery(
     ['lists'],
     () => listsApi.getLists()
   )
   ```

Write component tests:
- Lists load and display
- Create new list works
- Delete with confirmation works
- Navigation to edit page works
```

---

## Prompt 50: List Editor Page

```
Create the list editor with inline editing and auto-save.

1. Create src/pages/ListEditPage.vue:
   - Load list by ID
   - Inline editable name
   - Inline editable description
   - List of adjective cards
   - Add new adjective button
   - Sharing settings panel

2. Create src/components/lists/InlineEditField.vue:
   - Props: value, placeholder, multiline
   - Emits: update:value, save
   - Shows text normally
   - Click to edit (or always editable per spec)
   - Auto-save on blur with debounce

3. Create src/components/lists/AdjectiveCard.vue:
   - Inline editable: word, explanation, example
   - Delete button (with confirmation)
   - Drag handle for reordering
   - Auto-save on field blur

4. Create src/composables/useAutoSave.ts:
   - Debounced save function
   - Track saving/saved/error state
   - Retry on error
   - Return: { save, status, error }

5. Reordering:
   - Use vuedraggable or similar
   - Drag and drop adjectives
   - Save new order to API

6. Auto-save status indicator:
   - Show "Speichert…" during save
   - Show "Gespeichert" after success
   - Show error with retry on failure

Write component tests:
- Fields are editable
- Auto-save triggers on blur
- Status indicator updates
- Reordering works
- Delete with confirmation
```

---

## Prompt 51: Sharing Settings UI

```
Create the sharing settings panel for lists.

1. Create src/components/lists/SharingPanel.vue:
   - Toggle: "Teilen aktivieren"
   - Date picker: Ablaufdatum
   - Toggle: "Mit Schule teilen"
   - Share link display (when enabled)
   - QR code display

2. Install qrcode (for generating QR codes)

3. Create src/components/lists/ShareLinkDisplay.vue:
   - Shows full URL
   - Copy button (copies to clipboard)
   - Success feedback on copy

4. Create src/components/lists/QRCodeDisplay.vue:
   - Generate QR code from URL
   - Display as image
   - Download QR button (optional)

5. Share URL format:
   - https://vielseitig.zumgugger.ch/l/{token}

6. Auto-save sharing settings:
   - Each toggle/date change saves automatically
   - Status indicator

7. QR code generation:
   ```typescript
   import QRCode from 'qrcode'
   
   async function generateQR(url: string): Promise<string> {
     return await QRCode.toDataURL(url, {
       width: 200,
       margin: 2,
       color: { dark: '#000', light: '#fff' }
     })
   }
   ```

Write component tests:
- Toggle enables/disables sharing
- URL updates when enabled
- QR code generates correctly
- Copy to clipboard works
- Date picker updates expiry
```

---

## Prompt 52: Admin Login Page

```
Create the admin login page.

1. Create src/pages/admin/AdminLoginPage.vue:
   - Simple login form
   - Username input
   - Password input
   - Submit button
   - Error handling
   - Redirect to /admin on success

2. Route: /admin/login
   - Public access
   - Redirect to /admin if already logged in as admin

3. Styling:
   - Center on page
   - Clean, minimal design
   - Different from user login (admin context clear)

4. Connect to auth store:
   - Call adminLogin action
   - Handle success/error

Write component tests:
- Form submits correctly
- Error displays on invalid credentials
- Redirect on success
- Already logged in redirects
```

---

## Prompt 53: Admin Dashboard Page

```
Create the admin dashboard with analytics.

1. Create src/pages/admin/AdminDashboard.vue:
   - Welcome message
   - Quick links to pending approvals
   - Analytics summary cards
   - Navigation sidebar

2. Create src/components/admin/StatCard.vue:
   - Props: title, value, icon?, trend?
   - Display stat in card format
   - Loading skeleton state

3. Create src/components/admin/AnalyticsDashboard.vue:
   - Fetch analytics summary
   - Display:
     - Total sessions
     - Average duration
     - PDF exports count
     - Top adjectives in "oft" (simple list)
     - Theme distribution (simple bar/list)

4. Simple visualizations (no chart library needed for MVP):
   - Top adjectives: ordered list with counts
   - Theme distribution: horizontal bars or simple list

5. Data fetching:
   ```typescript
   const { data, isLoading } = useQuery(
     ['admin', 'analytics'],
     () => adminApi.getAnalyticsSummary()
   )
   ```

Write component tests:
- Dashboard loads analytics
- Stats display correctly
- Loading states work
- Error handling
```

---

## Prompt 54: Admin User Management UI

```
Create admin pages for user management.

1. Create src/pages/admin/AdminUsersPage.vue:
   - Tabs: "Ausstehend" and "Alle Users"
   - Filter by status
   - Search by email
   - Paginated table

2. Create src/components/admin/PendingUsersList.vue:
   - List pending users
   - Each row: email, school, registered date
   - Actions: Approve, Reject

3. Create src/components/admin/UserTable.vue:
   - Columns: Email, School, Status, Active Until, Actions
   - Status badges (pending/active/passive)
   - Sortable columns
   - Pagination

4. Create src/components/admin/UserActions.vue:
   - Dropdown or buttons:
     - Approve (if pending)
     - Deactivate (if active)
     - Activate (if passive)
     - Reset password
     - Delete

5. User detail modal/drawer:
   - Edit status
   - Set active_until date
   - Reset password form
   - Notes field

6. Confirmation dialogs:
   - Delete user: "User wirklich löschen?"
   - Reset password: shows new password or success

Write component tests:
- Table displays users
- Filters work
- Approve/reject flow
- Status changes persist
```

---

## Prompt 55: Admin School Management UI

```
Create admin pages for school management.

1. Create src/pages/admin/AdminSchoolsPage.vue:
   - Tabs: "Ausstehend" and "Alle Schulen"
   - List/table of schools

2. Create src/components/admin/PendingSchoolsList.vue:
   - List pending schools
   - Each row: name, created date, pending users count
   - Actions: Approve, Reject

3. Create src/components/admin/SchoolTable.vue:
   - Columns: Name, Status, User Count, Created
   - Status badges
   - Sortable
   - Pagination

4. School actions:
   - Approve: activates school and all its users
   - Reject: deletes school (cascades to users)

5. Confirmation dialogs:
   - Reject school: "Schule und alle zugehörigen Users löschen?"
   - Clear warning about cascade delete

6. Connect to API:
   - Approve calls POST /api/admin/schools/:id/approve
   - Handles license propagation automatically

Write component tests:
- Schools display correctly
- Approve activates users (verify in UI or API mock)
- Reject shows warning
- Cascade delete explained
```

---

## Prompt 56: Static Pages

```
Create the legal/static pages.

1. Create src/pages/ImpressumPage.vue:
   - Static content page
   - Placeholder text: "Impressum wird noch ergänzt."
   - Simple, clean layout
   - Back link to home

2. Create src/pages/DatenschutzPage.vue:
   - Static content page
   - Placeholder text with key message:
     "Von Schüler:innen werden keine personenbezogenen Daten gespeichert.
      Ergebnisse werden nur lokal auf dem Gerät verarbeitet."
   - Simple, clean layout
   - Back link to home

3. Update AppFooter.vue:
   - Links to /impressum and /datenschutz
   - Open in same tab

4. Styling:
   - Consistent with app theme
   - Readable text
   - Proper headings structure
   - Max-width for readability

Write component tests:
- Pages render
- Links from footer work
- Content displays
```

---

## Prompt 57: Accessibility Audit & Fixes

```
Perform accessibility improvements across the application.

1. Keyboard navigation:
   - Ensure all interactive elements focusable
   - Visible focus indicators
   - Tab order is logical
   - Skip to content link

2. Screen reader support:
   - Add aria-labels to icon-only buttons
   - Announce sorting progress
   - Announce bucket assignments
   - Use semantic HTML (headings, lists, etc.)

3. Create src/composables/useAnnounce.ts:
   - Live region for announcements
   - announce(message, priority) function
   - Use for dynamic updates

4. Color contrast:
   - Verify all themes meet WCAG AA
   - Fix any failing combinations
   - Document color ratios

5. Reduced motion:
   - Check prefers-reduced-motion
   - Disable animations when true
   - Apply to all animated components

6. Update components:
   - Add aria-current to active bucket
   - Add aria-live to progress indicator
   - Add role="status" to auto-save indicator

7. Create src/styles/accessibility.css:
   - Focus visible styles
   - Reduced motion overrides
   - High contrast mode support (optional)

Write accessibility tests:
- axe-core integration
- Keyboard navigation flow
- Focus management
- ARIA attributes present
```

---

## Prompt 58: E2E Test Setup

```
Set up Playwright for end-to-end testing.

1. Install Playwright:
   - @playwright/test
   - Configure browsers (chromium, firefox, webkit)

2. Create playwright.config.ts:
   - Base URL: http://localhost:5173
   - Test directory: e2e/
   - Web server command to start app
   - Screenshots on failure
   - Trace on failure

3. Create e2e/fixtures.ts:
   - Test data helpers
   - API mocking utilities
   - Auth helpers

4. Create e2e/utils.ts:
   - Common test utilities
   - Page object helpers
   - Wait utilities

5. Create e2e/setup/global-setup.ts:
   - Seed test database
   - Create test users

6. Add npm scripts:
   - "test:e2e": "playwright test"
   - "test:e2e:ui": "playwright test --ui"
   - "test:e2e:debug": "playwright test --debug"

7. Create first test e2e/smoke.spec.ts:
   - App loads
   - Default list loads
   - Can assign first adjective

Write the smoke test to verify setup works.
```

---

## Prompt 59: Student Flow E2E Tests

```
Write comprehensive E2E tests for student sorting flow.

1. Create e2e/student/sorting.spec.ts:
   
   Test: "complete sorting flow with default list"
   - Navigate to /
   - Verify first adjective displays
   - Assign to "oft" (keyboard D)
   - Verify progress updates
   - Verify hex preview updates
   - Continue until all assigned
   - Verify completion modal
   - Click "Fortfahren"
   - Verify result page

2. Test: "keyboard shortcuts work"
   - A assigns to selten
   - S assigns to manchmal
   - D assigns to oft
   - W undoes last action
   - Space toggles explanation

3. Test: "drag and drop works"
   - Drag card to bucket
   - Verify assignment

4. Test: "undo functionality"
   - Assign several cards
   - Undo
   - Verify card returns
   - Verify hex preview updates

5. Test: "session persistence"
   - Assign some cards
   - Refresh page
   - Verify progress restored
   - Verify hex layout restored

6. Test: "custom list via token"
   - Create test list with token
   - Navigate to /l/{token}
   - Verify correct list loads

7. Test: "invalid token shows error"
   - Navigate to /l/invalid-token
   - Verify error message

Write all tests with proper assertions.
```

---

## Prompt 60: User Flow E2E Tests

```
Write E2E tests for user (teacher) flows.

1. Create e2e/user/auth.spec.ts:
   
   Test: "user registration flow"
   - Navigate to /login
   - Switch to register tab
   - Fill form with new email
   - Select existing school
   - Submit
   - Verify pending message
   
   Test: "user registration with new school"
   - Register with new school name
   - Verify both user and school pending

   Test: "user login flow"
   - Login with active user
   - Verify redirect to dashboard
   
   Test: "login fails for pending user"
   - Try login with pending user
   - Verify error message

2. Create e2e/user/lists.spec.ts:
   
   Test: "view lists"
   - Login as active user
   - Navigate to lists
   - Verify default list visible
   - Verify own lists visible
   
   Test: "create new list"
   - Create list with name
   - Verify appears in list
   
   Test: "edit list inline"
   - Edit list name
   - Verify auto-saves
   
   Test: "add adjective to list"
   - Add new adjective
   - Fill fields
   - Verify appears in list
   
   Test: "enable sharing"
   - Enable sharing
   - Verify link and QR appear
   - Copy link works

Write all tests with proper assertions.
```

---

## Prompt 61: Admin Flow E2E Tests

```
Write E2E tests for admin flows.

1. Create e2e/admin/auth.spec.ts:
   
   Test: "admin login"
   - Navigate to /admin/login
   - Login with admin credentials
   - Verify redirect to admin dashboard
   
   Test: "admin logout"
   - Logout
   - Verify redirect to login
   - Cannot access admin pages

2. Create e2e/admin/users.spec.ts:
   
   Test: "view pending users"
   - Navigate to users page
   - Verify pending tab shows users
   
   Test: "approve user"
   - Approve pending user
   - Verify status changes to active
   - Verify user can now login
   
   Test: "reject user"
   - Reject pending user
   - Verify user deleted
   
   Test: "reset user password"
   - Reset password
   - Verify success message

3. Create e2e/admin/schools.spec.ts:
   
   Test: "approve school"
   - Approve pending school
   - Verify school status active
   - Verify all users of school activated
   
   Test: "reject school cascades"
   - Reject school
   - Verify school and users deleted

4. Create e2e/admin/analytics.spec.ts:
   
   Test: "analytics dashboard displays"
   - Navigate to dashboard
   - Verify stats cards render
   - Verify numbers are reasonable

Write all tests with proper assertions.
```

---

## Prompt 62: Production Docker Configuration

```
Create production Docker configuration.

1. Create backend/Dockerfile.prod:
   - Multi-stage build
   - Stage 1: Build TypeScript
   - Stage 2: Production image (node:20-alpine)
   - Copy only dist and node_modules
   - Run as non-root user
   - Health check

2. Create frontend/Dockerfile.prod:
   - Multi-stage build
   - Stage 1: Build with Vite
   - Stage 2: Nginx alpine
   - Copy built files to nginx html
   - Custom nginx.conf for SPA routing

3. Create frontend/nginx.conf:
   - Serve static files
   - SPA fallback to index.html
   - Gzip compression
   - Cache headers for assets
   - Security headers

4. Create docker-compose.prod.yml:
   - Backend service with env vars
   - No frontend service (nginx in backend or separate)
   - Volume for SQLite database
   - Network configuration
   - Restart policies

5. Create .env.example:
   - All required environment variables
   - Documentation comments

6. Production environment variables:
   - NODE_ENV=production
   - DB_PATH=/data/vielseitig.db
   - SESSION_SECRET=<generate>
   - TWILIO_* variables
   - ADMIN_PHONE_NUMBER

Write deployment documentation in README.
```

---

## Prompt 63: Apache Reverse Proxy Configuration

```
Create Apache configuration for the deployment.

1. Create deploy/apache/vielseitig.conf:
   - VirtualHost for vielseitig.zumgugger.ch
   - HTTPS redirect
   - Let's Encrypt SSL
   - Reverse proxy to Docker containers
   - WebSocket support (if needed)
   - Security headers

2. Apache configuration:
   ```apache
   <VirtualHost *:80>
       ServerName vielseitig.zumgugger.ch
       Redirect permanent / https://vielseitig.zumgugger.ch/
   </VirtualHost>

   <VirtualHost *:443>
       ServerName vielseitig.zumgugger.ch
       
       SSLEngine on
       SSLCertificateFile /etc/letsencrypt/live/vielseitig.zumgugger.ch/fullchain.pem
       SSLCertificateKeyFile /etc/letsencrypt/live/vielseitig.zumgugger.ch/privkey.pem
       
       # Proxy to backend
       ProxyPreserveHost On
       ProxyPass / http://localhost:3000/
       ProxyPassReverse / http://localhost:3000/
       
       # Security headers
       Header always set X-Content-Type-Options "nosniff"
       Header always set X-Frame-Options "DENY"
       Header always set X-XSS-Protection "1; mode=block"
   </VirtualHost>
   ```

3. Create deploy/setup.sh:
   - Install Docker if needed
   - Pull images
   - Start containers
   - Run migrations/seeds
   - Configure Apache

4. Create deploy/README.md:
   - Step-by-step deployment guide
   - SSL certificate setup
   - Environment configuration
   - Backup procedures

Document the complete deployment process.
```

---

## Prompt 64: Production Seed and Initial Setup

```
Create production initialization scripts.

1. Create backend/scripts/init-production.ts:
   - Run migrations
   - Run seeds (default list, admin)
   - Verify database integrity
   - Print admin credentials reminder

2. Create backend/scripts/create-admin.ts:
   - CLI script to create/reset admin
   - Prompts for username and password
   - Or accepts arguments
   - Usage: npm run create-admin -- --username admin --password <pwd>

3. Update seed to accept admin password from env:
   - If ADMIN_INITIAL_PASSWORD set, use it
   - Otherwise generate random and print

4. Create backend/scripts/backup-db.ts:
   - Copy SQLite file to backup location
   - Add timestamp to filename
   - Keep last N backups

5. Add npm scripts:
   - "init:prod": "ts-node scripts/init-production.ts"
   - "create-admin": "ts-node scripts/create-admin.ts"
   - "backup": "ts-node scripts/backup-db.ts"

6. Docker entrypoint script:
   - Run migrations on startup
   - Run seeds if fresh database
   - Then start application

7. Create backend/docker-entrypoint.sh:
   ```bash
   #!/bin/sh
   npm run migrate
   npm run seed
   exec node dist/index.js
   ```

Write documentation for production setup.
```

---

## Prompt 65: Final Integration Testing

```
Perform final integration and polish.

1. Create e2e/integration/full-flow.spec.ts:
   - Complete user journey test:
     - Admin approves school and user
     - User logs in
     - User creates custom list
     - User enables sharing
     - Student opens share link
     - Student completes sorting
     - Student exports PDF
     - Verify analytics recorded

2. Performance checks:
   - Page load times
   - API response times
   - PDF generation time
   - Database query performance

3. Create e2e/integration/edge-cases.spec.ts:
   - Empty "oft" bucket → still shows result
   - Many items in "oft" → layout handles gracefully
   - Very long adjective text → truncates/wraps properly
   - Network errors → graceful handling

4. Final UI polish:
   - Review all error messages (German)
   - Check loading states
   - Verify theme consistency
   - Test all 6 themes visually

5. Security checklist:
   - HTTPS enforced
   - Session secure
   - CSRF protection (if needed)
   - Input validation
   - No sensitive data in logs

6. Documentation review:
   - README complete
   - API documented
   - Deployment guide tested
   - Admin guide for user management

Run complete test suite and fix any issues.
```

---

# Summary

This blueprint provides a structured approach to building the "Ich bin" Adjektiv-Sortier-Tool with:

- **65 implementation prompts** organized into 15 phases
- **Test-driven development** with tests at each step
- **Incremental progress** where each step builds on previous work
- **No orphaned code** - everything integrates into the working application
- **Real API calls** for Twilio SMS integration
- **Production-ready** Docker and deployment configuration

## Recommended Development Order

1. **Phases 1-3**: Foundation (backend setup, database, auth) - ~2 weeks
2. **Phases 4-5**: Admin and Public APIs - ~1 week
3. **Phases 6-9**: Frontend foundation and sorting UI - ~2 weeks
4. **Phases 10-11**: Result view and PDF export - ~1 week
5. **Phases 12-13**: User and Admin frontends - ~1.5 weeks
6. **Phases 14-15**: Deployment and polish - ~1 week

**Total estimated time**: 8-10 weeks for MVP

## Key Principles Applied

1. **Small, testable steps** - each prompt produces working, tested code
2. **Backend before frontend** - APIs ready before UI consumes them
3. **Core features first** - sorting flow before admin features
4. **Security from start** - auth built early, not bolted on
5. **Continuous integration** - each step integrates with previous work
