import { permanentRedirect } from "next/navigation";

/* Legacy plural route: keep it working, but send visitors to Learn's FAQ. */
export default function FaqsRedirect() {
  permanentRedirect("/learn#faq");
}
