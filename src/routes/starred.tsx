import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/notesync/Workspace";
import { useNotes } from "@/components/notesync/store";

export const Route = createFileRoute("/starred")({
  head: () => ({
    meta: [
      { title: "Starred — NoteSync" },
      { name: "description", content: "Notes you've starred." },
    ],
  }),
  component: StarredPage,
});

function StarredPage() {
  const { notes } = useNotes();
  const filtered = notes.filter((n) => n.starred && n.folder !== "Trash");
  return <Workspace notes={filtered} heading="Starred" />;
}
