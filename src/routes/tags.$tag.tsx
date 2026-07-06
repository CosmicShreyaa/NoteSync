import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/notesync/Workspace";
import { useNotes } from "@/components/notesync/store";

export const Route = createFileRoute("/tags/$tag")({
  head: ({ params }) => ({
    meta: [
      { title: `#${params.tag} — NoteSync` },
      { name: "description", content: `Notes tagged #${params.tag}.` },
    ],
  }),
  component: TagPage,
});

function TagPage() {
  const { tag } = Route.useParams();
  const { notes } = useNotes();
  const filtered = notes.filter((n) => n.tags?.includes(tag) && n.folder !== "Trash");
  return <Workspace notes={filtered} heading={`#${tag}`} />;
}
