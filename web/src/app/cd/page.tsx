import type { Metadata } from "next";
import { CDCalculator } from "./cd-calculator";

export const metadata: Metadata = {
  title: "CD Calculator",
  description:
    "Project a certificate of deposit to maturity, including an optional early-withdrawal penalty scenario.",
};

export default function CDPage() {
  return <CDCalculator />;
}
