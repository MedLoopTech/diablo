import { ProfessionalsLanding } from "@/components/marketing/ProfessionalsLanding";

const TITLE = "Join the Care Network — Loop/90 for Professionals";
const DESCRIPTION =
  "Doctors, clinical nutritionists, and movement coaches: join a Loop/90 care pod. We run operations, billing, and patient support — you make the clinical calls.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/professionals" },
  openGraph: {
    siteName: "Loop/90",
    title: TITLE,
    description: DESCRIPTION,
    url: "/professionals",
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512 }],
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION, images: ["/icon-512.png"] },
};

export default function ProfessionalsPage() {
  return <ProfessionalsLanding />;
}
