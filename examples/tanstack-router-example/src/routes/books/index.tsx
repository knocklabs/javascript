import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/books/")({
  component: Books,
});

function Books() {
  return (
    <div>
      <h2>Book List</h2>
      <ul>
        <li>Atomic Habits</li>
        <li>Deep Work</li>
        <li>A Random Walk Down Wall Street</li>
      </ul>
    </div>
  );
}
