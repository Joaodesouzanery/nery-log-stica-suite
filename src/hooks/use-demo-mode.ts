import { useContext } from "react";
import { DemoContext } from "@/lib/demo-context";

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemoMode must be used within DemoProvider");
  }
  return context;
}
