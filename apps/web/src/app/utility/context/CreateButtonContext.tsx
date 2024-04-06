import { createContext, useContext, useState } from "react";

interface CreateButtonContextProps {
  isVisibleButton: boolean;
  setIsVisibleButton?: (value: boolean) => void;
}

const defaultCreateButtonContext: CreateButtonContextProps = {
  isVisibleButton: false,
};

const CreateButtonContext = createContext<CreateButtonContextProps>(
  defaultCreateButtonContext
);

export const CreateButtonProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isVisibleButton, setIsVisibleButton] = useState<boolean>(false);

  return (
    <CreateButtonContext.Provider
      value={{
        isVisibleButton,
        setIsVisibleButton,
      }}
    >
      {children}
    </CreateButtonContext.Provider>
  );
};

const useCreateButton = () => useContext(CreateButtonContext);

export default useCreateButton;
