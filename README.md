# NoteSync

NoteSync is a collaborative notes workspace built with React, TanStack Start, Express, and MongoDB. It provides a polished writing interface for organizing notes by folder and tag, managing collaborators, adding comments, and persisting note data through a REST API.

The app is designed to work well during local development: if MongoDB is unavailable, the backend automatically falls back to an in-memory data store seeded with sample notes and collaborators.

## Features

- Modern three-pane notes workspace with sidebar navigation, note list, and editor
- Folder, tag, starred, shared, inbox, and recent-note views
- Markdown-friendly editor toolbar for bold, italic, code, links, lists, and quotes
- Auto-save style editing with optimistic UI updates
- Collaborator presence metadata and share dialog
- Invite and remove collaborators from individual notes
- Comment threads on notes
- Light and dark theme support
- REST API for notes, collaborators, comments, and health checks
- MongoDB persistence with automatic in-memory fallback for local demos
- Render deployment guide for hosting the frontend and API

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TanStack Start, TanStack Router, Vite |
| Styling | Tailwind CSS 4, Radix UI primitives, Lucide icons |
| State/Data | React context, optimistic fetch-based API sync |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Tooling | TypeScript, ESLint, Prettier, Nodemon, Concurrently |

## Project Structure

```text
.
├── public/                  # Static assets
├── server/                  # Express API and MongoDB models
│   ├── db.js                # MongoDB connection and fallback mode
│   ├── models.js            # Mongoose schemas
│   └── server.js            # API routes and server bootstrap
├── src/
│   ├── components/
│   │   ├── notesync/        # NoteSync workspace UI
│   │   └── ui/              # Shared UI primitives
│   ├── hooks/               # Theme and responsive hooks
│   ├── lib/                 # Data types, seed data, utilities
│   └── routes/              # TanStack Router routes
├── RENDER_DEPLOYMENT.md     # Render deployment walkthrough
├── package.json             # Root frontend/backend scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally, or a MongoDB Atlas connection string

MongoDB is recommended for persistence, but it is not required for a first run. Without a database connection, the API starts in in-memory mode and resets data whenever the server restarts.

### Installation

```bash
npm install
```

The root `package.json` contains both the frontend dependencies and the backend development scripts used by this project.

### Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/notesync
PORT=5000
VITE_API_URL=http://localhost:5000
```

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | No | MongoDB connection string. Defaults to `mongodb://127.0.0.1:27017/notesync`. |
| `PORT` | No | Port for the Express API. Defaults to `5000`. |
| `VITE_API_URL` | Recommended | Base URL for the frontend to reach the API. Use `http://localhost:5000` for local development. |

### Run the Application

Start the frontend and backend together:

```bash
npm run dev:all
```

Or run them separately:

```bash
npm run server
npm run dev
```

By default:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the TanStack/Vite development server |
| `npm run server` | Start the Express API with Nodemon |
| `npm run dev:all` | Start frontend and backend together |
| `npm run build` | Create a production frontend build |
| `npm run build:dev` | Build the frontend in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format files with Prettier |

## API Overview

The Express API is mounted under `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Return API status, storage mode, and current time |
| `GET` | `/api/collaborators` | List available collaborators |
| `GET` | `/api/notes` | List notes, sorted by update time |
| `GET` | `/api/notes/:id` | Fetch one note |
| `POST` | `/api/notes` | Create a note |
| `PUT` | `/api/notes/:id` | Update note fields |
| `DELETE` | `/api/notes/:id` | Delete a note |
| `POST` | `/api/notes/:id/comments` | Add a comment to a note |

Example health check:

```bash
curl http://localhost:5000/api/health
```

Example response:

```json
{
  "status": "ok",
  "mode": "mongodb",
  "time": "2026-07-17T08:00:00.000Z"
}
```

## Data Model

Notes include:

- Stable note ID
- Emoji, title, preview, and content
- Folder and tag metadata
- Starred, shared, and draft states
- Collaborator IDs
- Embedded comments
- Updated timestamp

Collaborators include:

- Stable collaborator ID
- Display name
- Initials
- Status
- CSS color variable

## Deployment

This repository includes a Render deployment guide in [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md). The recommended production setup is:

1. MongoDB Atlas for the database
2. Render Web Service for the Express API
3. Render Web Service for the TanStack Start frontend
4. `VITE_API_URL` on the frontend pointing to the deployed API URL

For TanStack Start production hosting, use:

```bash
npm run build
node .output/server/index.mjs
```

For the API service, use:

```bash
node server/server.js
```

## Development Notes

- The frontend falls back to bundled seed data if the API is unavailable.
- The backend falls back to in-memory data if MongoDB cannot be reached.
- In-memory mode is useful for demos but is not persistent.
- The current collaboration experience is modeled through collaborator metadata, comments, and optimistic note updates. Live multi-user editing would require adding a real-time transport such as WebSockets or a CRDT/OT layer.

## License

This project is licensed under the terms in [LICENSE](./LICENSE).
