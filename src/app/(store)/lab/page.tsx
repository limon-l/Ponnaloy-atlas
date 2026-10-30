import type { Metadata } from "next";
import { LabView } from "./lab-view";

export const metadata: Metadata = {
  title: "Design & motion lab",
  description:
    "Inspect the Atlas design system: semantic colour tokens, editorial type, accessible chart primitives, motion profiles and the interaction standards behind every surface.",
};

export default function LabPage() {
  return <LabView />;
}
