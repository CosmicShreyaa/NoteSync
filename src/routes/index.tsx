import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/notesync/Workspace";
import { useNotes } from "@/components/notesync/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { notes } = useNotes();
  const filtered = notes.filter((n) => n.folder !== "Trash");
  return <Workspace notes={filtered} heading="All notes" />;
}
