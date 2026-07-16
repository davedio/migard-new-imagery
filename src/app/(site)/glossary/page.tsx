import { permanentRedirect } from "next/navigation";

/* Glossary entries are part of Learn's permanent reference material. */
export default function GlossaryPage() {
  permanentRedirect("/learn#glossary");
}
