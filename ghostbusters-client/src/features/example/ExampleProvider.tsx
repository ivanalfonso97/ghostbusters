import type { Dispatch, ReactNode, SetStateAction } from "react";

import { ExampleContext } from "./context";
import type { Example } from "./types";

// The provider component is a pure wrapper — no logic here.
// State lives in the parent (usually the layout route) and is passed down as props.

export function ExampleProvider({
  example,
  setExample,
  children,
}: {
  example: Example | null;
  setExample: Dispatch<SetStateAction<Example | null>>;
  children: ReactNode;
}) {
  return (
    <ExampleContext.Provider value={{ example, setExample }}>
      {children}
    </ExampleContext.Provider>
  );
}
