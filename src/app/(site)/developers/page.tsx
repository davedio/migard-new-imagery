import DeveloperLanding from "@/components/minimal/DeveloperLanding";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("developers");

export default function DevelopersPage() {
  return <DeveloperLanding />;
}
