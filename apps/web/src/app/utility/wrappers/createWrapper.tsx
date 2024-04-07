"use client";

import CreateButton from "components/CreateButton";
import { CreateButtonProvider } from "../context/CreateButtonContext";
import CreationModal from "components/CreationModal";

export const CreateWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <CreateButtonProvider>
      {children}
      <CreateButton />
      <CreationModal />
    </CreateButtonProvider>
  );
};
