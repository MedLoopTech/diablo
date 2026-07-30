import { redirect } from "next/navigation";

export default function CohortPage() {
  redirect("/care?tab=community");
}
