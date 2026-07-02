import { permanentRedirect } from "next/navigation";

/* Direct to the FAQ section on /how-it-works (skips the /faq redirect hop). */
export default function FaqsRedirect() {
  permanentRedirect("/how-it-works#faq");
}
