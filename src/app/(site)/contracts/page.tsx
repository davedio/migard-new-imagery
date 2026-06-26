import { permanentRedirect } from "next/navigation";

export default function ContractsRedirect() {
  permanentRedirect("/developers#contracts");
}
