import { redirect } from "next/navigation";

export default function BuildersRedirect() {
  redirect("/get-started#builder-quickstart");
}
