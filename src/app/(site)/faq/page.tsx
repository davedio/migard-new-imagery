import { permanentRedirect } from "next/navigation";

/* The FAQ now lives in the Learn reference material. */
export default function FaqPage() {
  permanentRedirect("/learn#faq");
}
