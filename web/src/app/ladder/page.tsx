import type { Metadata } from "next";
import { LadderPlanner } from "./ladder-planner";

export const metadata: Metadata = {
  title: "CD Ladder",
  description:
    "Plan a CD ladder: split an amount across staggered maturities and see the projected liquidity schedule.",
};

export default function LadderPage() {
  return <LadderPlanner />;
}
