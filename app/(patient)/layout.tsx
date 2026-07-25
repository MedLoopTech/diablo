import { BottomNav } from "@/components/BottomNav";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-paper">
      <main className="px-[18px] pb-[98px] pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
