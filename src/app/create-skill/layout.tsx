import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create skill | ShowUp",
  description: "Define a new agent skill for ShowUp.",
};

export default function CreateSkillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
