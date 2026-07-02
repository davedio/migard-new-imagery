import { permanentRedirect } from "next/navigation";

/* /learn folded into /how-it-works — the single Learn destination. */
export default function LearnRedirect() {
  permanentRedirect("/how-it-works");
}
