import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SHA-256 Visualizer | Learn Bitcoin Mining Math",
  description:
    "Interactive educational tool demonstrating SHA-256 hashing, proof-of-work, and the cryptographic foundations of Bitcoin mining.",
};

export default function Sha256Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
