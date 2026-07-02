import { permanentRedirect } from "next/navigation";

/* The glossary now lives as an anchored section on /how-it-works. */
export default function GlossaryRedirect() {
  permanentRedirect("/how-it-works#glossary");
}
