import { permanentRedirect } from "next/navigation";

/* The FAQ now lives as an anchored section on /how-it-works. */
export default function FaqRedirect() {
  permanentRedirect("/how-it-works#faq");
}
