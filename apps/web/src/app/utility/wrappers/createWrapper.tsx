"use client";

import CreateButton from "components/CreateButton";
import { CreateButtonProvider } from "../context/CreateButtonContext";

export const createWrapper = (Component: React.FC) => {
  return (
    <CreateButtonProvider>
      <CreateButton />
    </CreateButtonProvider>
  );

};
