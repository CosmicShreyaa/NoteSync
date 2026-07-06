import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { COLLABORATORS, INITIAL_NOTES, type Note, type Collaborator } from "@/lib/notesync-data";

type Ctx = {
  notes: Note[];
  collaborators: Collaborator[];
  isLoading: boolean;
  addNote: (folder?: string) => string;
  duplicateNote: (note: Note) => string;
  toggleStar: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  updateContent: (id: string, content: string) => void;
  updateFolder: (id: string, folder: string) => void;
  updateEmoji: (id: string, emoji: string) => void;
  deleteNote: (id: string) => void;
  addCollaborator: (id: string, collaboratorId: string) => void;
  removeCollaborator: (id: string, collaboratorId: string) => void;
  addComment: (id: string, content: string) => void;
  listCollapsed: boolean;
  setListCollapsed: (v: boolean) => void;
};

const NotesCtx = createContext<Ctx | null>(null);

const EMOJIS = ["📝", "✨", "💡", "📌", "🧠", "🌱", "🎯", "🪄", "🧭", "☀️"];

// Backend API URL configuration (can be overriden in production env)
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "") + "/api";

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [notesRes, collabRes] = await Promise.all([
          fetch(`${API_BASE}/notes`).catch(() => null),
          fetch(`${API_BASE}/collaborators`).catch(() => null),
        ]);

        if (notesRes && notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(notesData);
        } else {
          setNotes(INITIAL_NOTES);
        }

        if (collabRes && collabRes.ok) {
          const collabData = await collabRes.json();
          setCollaborators(collabData);
        } else {
          setCollaborators(COLLABORATORS);
        }
      } catch (error) {
        console.error("Failed to load backend data, falling back to mock:", error);
        setNotes(INITIAL_NOTES);
        setCollaborators(COLLABORATORS);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const addNote = useCallback((folder = "Personal") => {
    const id = `n_${Math.random().toString(36).slice(2, 8)}`;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const note: Note = {
      id,
      emoji,
      title: "Untitled",
      preview: "Start writing to bring this note to life…",
      content: "",
      updated: "just now",
      folder,
      tags: [],
      draft: true,
      collaborators: ["u1"],
      comments: [],
    };
    
    // Optimistic update
    setNotes((prev) => [note, ...prev]);

    // Sync with backend
    fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    }).catch((err) => console.error("Error creating note on backend:", err));

    return id;
  }, []);

  const duplicateNote = useCallback((sourceNote: Note) => {
    const id = `n_${Math.random().toString(36).slice(2, 8)}`;
    const copyTitle = sourceNote.title === "Untitled" ? "Untitled Copy" : `${sourceNote.title} (Copy)`;
    const newNote: Note = {
      id,
      emoji: sourceNote.emoji,
      title: copyTitle,
      preview: sourceNote.preview,
      content: sourceNote.content || "",
      updated: "just now",
      folder: sourceNote.folder,
      tags: [...(sourceNote.tags || [])],
      draft: sourceNote.draft,
      collaborators: ["u1"],
      comments: [],
    };
    
    // Optimistic update
    setNotes((prev) => [newNote, ...prev]);

    // Sync with backend
    fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote),
    }).catch((err) => console.error("Error duplicating note:", err));

    return id;
  }, []);

  const toggleStar = useCallback((id: string) => {
    setNotes((prev) => {
      const note = prev.find((n) => n.id === id);
      if (!note) return prev;
      const newStarred = !note.starred;

      fetch(`${API_BASE}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: newStarred }),
      }).catch((err) => console.error("Error toggling star:", err));

      return prev.map((n) => (n.id === id ? { ...n, starred: newStarred } : n));
    });
  }, []);

  const updateTitle = useCallback((id: string, title: string) => {
    setNotes((prev) => {
      const note = prev.find((n) => n.id === id);
      if (!note) return prev;

      fetch(`${API_BASE}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      }).catch((err) => console.error("Error updating title:", err));

      return prev.map((n) => (n.id === id ? { ...n, title, updated: "just now" } : n));
    });
  }, []);

  const updateContent = useCallback((id: string, content: string) => {
    setNotes((prev) => {
      const note = prev.find((n) => n.id === id);
      if (!note) return prev;

      const cleanContent = content
        .replace(/[#*`_>]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const preview = cleanContent.slice(0, 80) + (cleanContent.length > 80 ? "…" : "");

      fetch(`${API_BASE}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }).catch((err) => console.error("Error updating content:", err));

      return prev.map((n) => (n.id === id ? { ...n, content, preview, updated: "just now" } : n));
    });
  }, []);

  const updateFolder = useCallback((id: string, folder: string) => {
    setNotes((prev) => {
      const note = prev.find((n) => n.id === id);
      if (!note) return prev;

      fetch(`${API_BASE}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      }).catch((err) => console.error("Error updating folder:", err));

      return prev.map((n) => (n.id === id ? { ...n, folder, updated: "just now" } : n));
    });
  }, []);

  const updateEmoji = useCallback((id: string, emoji: string) => {
    setNotes((prev) => {
      const note = prev.find((n) => n.id === id);
      if (!note) return prev;

      fetch(`${API_BASE}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      }).catch((err) => console.error("Error updating emoji:", err));

      return prev.map((n) => (n.id === id ? { ...n, emoji, updated: "just now" } : n));
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));

    fetch(`${API_BASE}/notes/${id}`, {
      method: "DELETE",
    }).catch((err) => console.error("Error deleting note:", err));
  }, []);

  const addCollaborator = useCallback((id: string, collaboratorId: string) => {
    setNotes((prev) => {
      const note = prev.find((n) => n.id === id);
      if (!note) return prev;
      
      const newCollabs = note.collaborators.includes(collaboratorId)
        ? note.collaborators
        : [...note.collaborators, collaboratorId];

      fetch(`${API_BASE}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaborators: newCollabs }),
      }).catch((err) => console.error("Error adding collaborator:", err));

      return prev.map((n) => (n.id === id ? { ...n, collaborators: newCollabs } : n));
    });
  }, []);

  const removeCollaborator = useCallback((id: string, collaboratorId: string) => {
    setNotes((prev) => {
      const note = prev.find((n) => n.id === id);
      if (!note) return prev;

      const newCollabs = note.collaborators.filter((c) => c !== collaboratorId);

      fetch(`${API_BASE}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaborators: newCollabs }),
      }).catch((err) => console.error("Error removing collaborator:", err));

      return prev.map((n) => (n.id === id ? { ...n, collaborators: newCollabs } : n));
    });
  }, []);

  const addComment = useCallback((id: string, content: string) => {
    const commentBody = {
      userName: "Maya Chen",
      userInitials: "MC",
      userColor: "var(--user-1)",
      content,
    };

    const tempComment = {
      ...commentBody,
      id: `c_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, comments: [...(n.comments || []), tempComment] } : n
      )
    );

    fetch(`${API_BASE}/notes/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentBody),
    }).then(async (res) => {
      if (res.ok) {
        const realComment = await res.json();
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  comments: (n.comments || []).map((c) =>
                    c.id === tempComment.id ? realComment : c
                  ),
                }
              : n
          )
        );
      }
    }).catch((err) => console.error("Error adding comment:", err));
  }, []);

  const value = useMemo(
    () => ({
      notes,
      collaborators,
      isLoading,
      addNote,
      duplicateNote,
      toggleStar,
      updateTitle,
      updateContent,
      updateFolder,
      updateEmoji,
      deleteNote,
      addCollaborator,
      removeCollaborator,
      addComment,
      listCollapsed,
      setListCollapsed,
    }),
    [notes, collaborators, isLoading, addNote, duplicateNote, toggleStar, updateTitle, updateContent, updateFolder, updateEmoji, deleteNote, addCollaborator, removeCollaborator, addComment, listCollapsed],
  );

  return <NotesCtx.Provider value={value}>{children}</NotesCtx.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesCtx);
  if (!ctx) throw new Error("useNotes outside NotesProvider");
  return ctx;
}

export { COLLABORATORS };

