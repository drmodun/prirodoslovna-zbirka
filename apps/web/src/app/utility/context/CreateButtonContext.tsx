import { createContext, useContext, useState } from "react";

interface CreateButtonContextProps {
  isVisibleButton: boolean;
  isVisibleModal?: boolean;
  hideButton?: () => void;
  hideModal?: () => void;
  showButton?: () => void;
  showModal?: () => void;
}

const defaultCreateButtonContext: CreateButtonContextProps = {
  isVisibleButton: false,
  isVisibleModal: false,
  hideButton: () => {},
  hideModal: () => {},
  showButton: () => {},
  showModal: () => {},
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
  const [isVisibleModal, setIsVisibleModal] = useState<boolean>(false);

  const hideButton = () => {
    setIsVisibleButton(false);
  };

  const hideModal = () => {
    setIsVisibleModal(false);
  };

  const showButton = () => {
    setIsVisibleButton(true);
  };

  const showModal = () => {
    setIsVisibleModal(true);
  };

  return (
    <CreateButtonContext.Provider
      value={{
        isVisibleButton,
        isVisibleModal,
        hideButton,
        hideModal,
        showButton,
        showModal,
      }}
    >
      {children}
    </CreateButtonContext.Provider>
  );
};

const useCreateButton = () => useContext(CreateButtonContext);

export default useCreateButton;
