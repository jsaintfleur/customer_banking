import type { Metadata } from "next";
import { CompareTool } from "./compare-tool";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Compare savings accounts and CDs side by side — balances, interest, liquidity, and inflation-adjusted value.",
};

export default function ComparePage() {
  return <CompareTool />;
}
