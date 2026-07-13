import type { Metadata } from "next";
import { SavingsCalculator } from "./savings-calculator";

export const metadata: Metadata = {
  title: "Savings Calculator",
  description:
    "Project how a savings balance could grow with compound interest and monthly contributions.",
};

export default function SavingsPage() {
  return <SavingsCalculator />;
}
