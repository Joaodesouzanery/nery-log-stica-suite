import { createContext } from "react";

export type DemoContextValue = {
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
};

export const DemoContext = createContext<DemoContextValue | undefined>(undefined);
