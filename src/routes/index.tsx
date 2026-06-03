import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/deck/Deck";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevDeck — Building modern web apps with AI" },
      {
        name: "description",
        content:
          "A keyboard-driven slide deck on building modern web apps with AI. Press / for command palette.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Deck />;
}
