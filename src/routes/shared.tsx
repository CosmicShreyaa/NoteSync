import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/notesync/Workspace";
import { useNotes } from "@/components/notesync/store";

export const Route = createFileRoute("/shared")({
  head: () => ({
    meta: [
      { title: "Shared with me — NoteSync" },
      { name: "description", content: "Notes shared with you by collaborators." },
    ],
  }),
  component: SharedPage,
});

function SharedPage() {
  const { notes } = useNotes();
  const filtered = notes.filter((n) => n.shared && n.folder !== "Trash");
  return <Workspace notes={filtered} heading="Shared with me" />;
}
