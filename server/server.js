import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, isMockDB } from "./db.js";
import { Note, Collaborator } from "./models.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seed data
const SEED_COLLABORATORS = [
  { id: "u1", name: "Maya Chen", colorVar: "var(--user-1)", initials: "MC", status: "editing" },
  { id: "u2", name: "Diego Ruiz", colorVar: "var(--user-2)", initials: "DR", status: "editing" },
  { id: "u3", name: "Priya N.", colorVar: "var(--user-3)", initials: "PN", status: "viewing" },
  { id: "u4", name: "Ola Berg", colorVar: "var(--user-4)", initials: "OB", status: "idle" },
];

const SEED_NOTES = [
  {
    id: "n1",
    emoji: "🚀",
    title: "Q3 Launch — Kickoff notes",
    content: `This quarter is about *real-time first*. Our editor should feel like a shared room — you can see who's here, what they're touching, and never worry about who has the latest version.

## Themes for the launch

- **Presence** that feels ambient, not noisy — subtle carets, gentle avatars, light selection highlights.
- **Offline‑safe** writing. If the network blinks, your words don't.
- **Rich embeds** — code, tasks, diagrams — that keep the doc feeling like one continuous surface.

> Diego is editing
> Draft copy for the landing hero: "Write together. Think out loud. Ship faster."

### Open questions
1. Do we ship comments in v1, or hold for the presence-only launch?
2. How do we handle conflicting edits on titles vs. body?
3. What's the smallest version of history we can ship and still feel safe?

\`\`\`javascript
// mock: subscribe to note updates
socket.on("note:update", (op) => {
  applyOperation(op);
  presence.setLastSeen(op.userId, Date.now());
});
\`\`\`

> "The best collaborative tools disappear. You're just writing with someone."`,
    starred: true,
    folder: "Product",
    tags: ["launch", "specs"],
    shared: true,
    draft: false,
    collaborators: ["u1", "u2", "u3"],
    comments: [
      {
        id: "c1",
        userName: "Priya N.",
        userInitials: "PN",
        userColor: "var(--user-3)",
        content: "Love the direction. Can we make the presence colors color-blind safe? I can pull palettes from the design system.",
        createdAt: new Date(Date.now() - 8 * 60 * 1000)
      }
    ]
  },
  {
    id: "n2",
    emoji: "🧪",
    title: "Research: async writing rituals",
    content: `# Research: async writing rituals
Interview highlights from 12 remote teams — surprising overlap around Fridays.

## Key Insights
- Teams hate status reports but love writing weekly reflections.
- Writing is more structured on Friday mornings before wrapping up.
- Most teams have a designated coordinator to summarize long threads.`,
    folder: "Research",
    tags: ["research"],
    shared: true,
    draft: false,
    collaborators: ["u1", "u4"],
    comments: []
  },
  {
    id: "n3",
    emoji: "🗺️",
    title: "Roadmap — next two quarters",
    content: `# Product Roadmap — H2
Themes: real-time first, offline-safe, and rich embeds.

## Target Timelines
- **Q3**: CRDT backend stabilization + Real-time presence UI
- **Q4**: Offline syncing support + Version history
- **Q1**: Third-party workspace integrations`,
    starred: true,
    folder: "Product",
    tags: ["specs"],
    shared: true,
    draft: false,
    collaborators: ["u2", "u3"],
    comments: []
  },
  {
    id: "n4",
    emoji: "🎨",
    title: "Design system tokens v2",
    content: `# Design System Tokens v2
Semantic color pass, radii scale, motion primitives, and dark mode audit.

## Progress
- [x] Color-blind check for collaborative avatars.
- [ ] Transition duration adjustments.
- [ ] Font pairings optimized for mobile screens.`,
    folder: "Design",
    tags: ["specs", "meta"],
    shared: true,
    draft: false,
    collaborators: ["u1", "u3", "u4"],
    comments: []
  },
  {
    id: "n5",
    emoji: "📓",
    title: "Weekly journal",
    content: `# Weekly Journal
What worked, what didn't, and the one thing to try next week.

- **Wins**: Ironed out the Nitro server setup.
- **Challenges**: Handling Tanstack SSR hydration discrepancies.
- **Next week**: Add proper MongoDB backing to prevent resetting state.`,
    folder: "Personal",
    tags: ["meta"],
    draft: true,
    collaborators: ["u1"],
    comments: []
  },
  {
    id: "n6",
    emoji: "🧵",
    title: "Meeting — Growth sync",
    content: `# Meeting — Growth Sync
Attribution weirdness on paid channels; homepage variant B is the winner.

## Action Items
- Diego: Dig into API attribution logs.
- Maya: Finalize copy for homepage Variant B.`,
    folder: "Meetings",
    tags: ["meta"],
    shared: true,
    draft: false,
    collaborators: ["u2", "u4"],
    comments: []
  },
  {
    id: "n7",
    emoji: "📚",
    title: "Reading list — Systems design",
    content: `# Systems Design Reading List
CRDTs, operational transforms, and the case for eventual consistency.

- *Designing Data-Intensive Applications* by Martin Kleppmann (Chapters 5, 7)
- *Conflict-free Replicated Data Types* (Shapiro et al., 2011)
- *Real-time Collaborative Editing Systems* (Sun et al.)`,
    folder: "Personal",
    tags: ["research"],
    draft: false,
    collaborators: ["u1", "u3"],
    comments: []
  },
  {
    id: "n8",
    emoji: "📈",
    title: "Weekly metrics review",
    content: `# Weekly Metrics Review
Activation is up 6.2% WoW; retention flat. Notes on the retention experiment.

- Core active user count: 12,400 (+450 WoW)
- Churn rate: 2.1% (stable)`,
    folder: "Meetings",
    tags: ["meta"],
    shared: true,
    draft: false,
    collaborators: ["u2", "u4", "u1"],
    comments: []
  },
  {
    id: "n9",
    emoji: "✏️",
    title: "Draft — Blog post on presence UX",
    content: `# Draft — Presence UX
Why ambient presence beats status dots — a working outline.

An analysis of why showing what someone is writing makes workspaces feel alive while status dots just cause performance anxiety.`,
    folder: "Design",
    tags: ["research"],
    draft: true,
    collaborators: ["u1", "u3"],
    comments: []
  },
];

// In-Memory state for mock fallback mode
let memoryNotes = [];
let memoryCollaborators = [];

// Seed DB / memory function
async function seedDatabase() {
  if (isMockDB()) {
    memoryNotes = JSON.parse(JSON.stringify(SEED_NOTES));
    memoryCollaborators = JSON.parse(JSON.stringify(SEED_COLLABORATORS));
    console.log("Memory seeded with mock data");
    return;
  }
  
  try {
    const colCount = await Collaborator.countDocuments();
    if (colCount === 0) {
      await Collaborator.insertMany(SEED_COLLABORATORS);
      console.log("Seeded database with collaborators");
    }
    const noteCount = await Note.countDocuments();
    if (noteCount === 0) {
      await Note.insertMany(SEED_NOTES);
      console.log("Seeded database with initial notes");
    }
  } catch (error) {
    console.error("Database seeding failed:", error);
  }
}

// Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    mode: isMockDB() ? "in-memory" : "mongodb",
    time: new Date() 
  });
});

// Collaborators
app.get("/api/collaborators", async (req, res) => {
  try {
    if (isMockDB()) {
      return res.json(memoryCollaborators);
    }
    const collaborators = await Collaborator.find();
    res.json(collaborators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notes Endpoints
app.get("/api/notes", async (req, res) => {
  try {
    if (isMockDB()) {
      // Sort in-memory notes by updated date (descending)
      const sorted = [...memoryNotes].sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
      return res.json(sorted);
    }
    const notes = await Note.find().sort({ updated: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/notes/:id", async (req, res) => {
  try {
    if (isMockDB()) {
      const note = memoryNotes.find(n => n.id === req.params.id);
      if (!note) return res.status(404).json({ error: "Note not found" });
      return res.json(note);
    }
    const note = await Note.findOne({ id: req.params.id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const noteData = req.body;
    if (!noteData.id) {
      noteData.id = "n_" + Math.random().toString(36).substring(2, 8);
    }
    noteData.updated = new Date().toISOString();
    
    if (isMockDB()) {
      memoryNotes.push(noteData);
      return res.status(201).json(noteData);
    }

    const note = new Note(noteData);
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/notes/:id", async (req, res) => {
  try {
    const fields = [
      "emoji", "title", "content", "starred", 
      "folder", "tags", "shared", "draft", "collaborators"
    ];
    
    if (isMockDB()) {
      const idx = memoryNotes.findIndex(n => n.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Note not found" });
      
      const note = memoryNotes[idx];
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          note[field] = req.body[field];
        }
      });
      note.updated = new Date().toISOString();
      
      // Update preview based on content
      if (req.body.content !== undefined && req.body.content) {
        const cleanContent = req.body.content
          .replace(/[#*`_>]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        note.preview = cleanContent.slice(0, 80) + (cleanContent.length > 80 ? "…" : "");
      }
      
      memoryNotes[idx] = note;
      return res.json(note);
    }

    const note = await Note.findOne({ id: req.params.id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        note[field] = req.body[field];
      }
    });

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    if (isMockDB()) {
      const idx = memoryNotes.findIndex(n => n.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Note not found" });
      memoryNotes.splice(idx, 1);
      return res.json({ message: "Note deleted successfully" });
    }

    const result = await Note.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comments Endpoint
app.post("/api/notes/:id/comments", async (req, res) => {
  try {
    const { userName, userInitials, userColor, content } = req.body;
    if (!content) return res.status(400).json({ error: "Comment content is required" });
    
    const comment = {
      id: "c_" + Math.random().toString(36).substring(2, 8),
      userName,
      userInitials,
      userColor,
      content,
      createdAt: new Date().toISOString()
    };

    if (isMockDB()) {
      const idx = memoryNotes.findIndex(n => n.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Note not found" });
      
      if (!memoryNotes[idx].comments) memoryNotes[idx].comments = [];
      memoryNotes[idx].comments.push(comment);
      memoryNotes[idx].updated = new Date().toISOString();
      return res.status(201).json(comment);
    }
    
    const note = await Note.findOne({ id: req.params.id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    
    note.comments.push(comment);
    await note.save();
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start Server
connectDB().then(() => {
  seedDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [Mode: ${isMockDB() ? "In-Memory" : "MongoDB"}]`);
    });
  });
});

export default app;
