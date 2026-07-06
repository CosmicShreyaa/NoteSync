import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/notesync/Workspace";
import { useNotes } from "@/components/notesync/store";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — NoteSync" },
      { name: "description", content: "New activity on notes shared with you." },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const { notes } = useNotes();
  const filtered = notes.filter((n) => n.shared && n.folder !== "Trash");
  return <Workspace notes={filtered} heading="Inbox" />;
}
