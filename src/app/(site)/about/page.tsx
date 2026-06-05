import { redirect } from "next/navigation";

// The About page was folded into the home page. Keep /about working for any
// existing links by redirecting to the home route where the content now lives.
export default function AboutRedirect() {
  redirect("/home");
}
