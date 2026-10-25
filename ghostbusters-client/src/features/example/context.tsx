import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext } from "react";

import type { Example } from "./types";

// The context pattern is always split into two files:
//   context.tsx       — defines the context object and the named consumer hooks
//   ExampleProvider.tsx — the React component that provides the value
//
// Consumer hooks throw if used outside the provider, so errors surface at dev time.

interface ExampleContextType {
  example: Example | null;
  setExample: Dispatch<SetStateAction<Example | null>>;
}

export const ExampleContext = createContext<ExampleContextType | null>(null);

export const useExampleContext = () => {
  const context = useContext(ExampleContext);
  if (context === null) {
    throw new Error("useExampleContext must be used within an ExampleProvider");
  }
  return context.example;
};

export const useSetExample = () => {
  const context = useContext(ExampleContext);
  if (context === null) {
    throw new Error("useSetExample must be used within an ExampleProvider");
  }
  return context.setExample;
};
