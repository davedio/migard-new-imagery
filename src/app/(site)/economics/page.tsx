import { permanentRedirect } from "next/navigation";

/* The Economics page was folded into the audience pages (2026-07-11):
   /users#economics, /developers#economics, /participate#economics, with
   the cross-entity comparison table living on /#economics. */
export default function EconomicsRedirect() {
  permanentRedirect("/#economics");
}
