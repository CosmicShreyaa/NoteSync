import { useEffect, useState } from "react";
import { useNotes } from "./store";
import { Sidebar } from "./Sidebar";
import { NoteList } from "./NoteList";
import { Editor } from "./Editor";
import type { Note } from "@/lib/notesync-data";
import { FileText } from "lucide-react";

export function Workspace({ notes, heading }: { notes: Note[]; heading: string }) {
  const { notes: allNotes } = useNotes();
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null);

  useEffect(() => {
    if (!notes.find((n) => n.id === selectedId)) {
      setSelectedId(notes[0]?.id ?? null);
    }
  }, [notes, selectedId]);

  // Editor always uses the freshest note object from the shared store.
  const selected = selectedId ? allNotes.find((n) => n.id === selectedId) ?? null : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <NoteList
        notes={notes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        heading={heading}
      />
      {selected ? (
        <Editor note={selected} />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Select a note to start writing.</p>
          </div>
        </div>
      )}
    </div>
  );
}
