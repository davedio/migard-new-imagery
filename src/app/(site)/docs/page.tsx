import { redirect } from "next/navigation";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

export default function DocsRedirect() {
  redirect(OFFICIAL_LINKS.docs);
}
