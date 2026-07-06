import { createFileRoute, notFound } from "@tanstack/react-router";
import { Workspace } from "@/components/notesync/Workspace";
import { useNotes } from "@/components/notesync/store";
import { folderBySlug, FOLDERS } from "@/lib/notesync-data";

export const Route = createFileRoute("/folders/$folder")({
  loader: ({ params }) => {
    const folder = folderBySlug(params.folder);
    if (!folder) throw notFound();
    return { folder };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.folder.name ?? "Folder";
    return {
      meta: [
        { title: `${name} — NoteSync` },
        { name: "description", content: `Notes in the ${name} folder.` },
        { property: "og:title", content: `${name} — NoteSync` },
        { property: "og:description", content: `Notes in the ${name} folder.` },
      ],
    };
  },
  component: FolderPage,
  notFoundComponent: FolderNotFound,
});

function FolderPage() {
  const { folder } = Route.useLoaderData();
  const { notes } = useNotes();
  const filtered = notes.filter((n) => n.folder === folder.name);
  return <Workspace notes={filtered} heading={folder.name} />;
}

function FolderNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-4xl">Folder not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try one of: {FOLDERS.map((f) => f.name).join(", ")}
        </p>
      </div>
    </div>
  );
}
