import { permanentRedirect } from "next/navigation";

/* Legacy plural route: keep it working, but send visitors to the real FAQ page. */
export default function FaqsRedirect() {
  permanentRedirect("/faq");
}
