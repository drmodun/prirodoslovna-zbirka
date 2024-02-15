export const ModalWrapper = ({
  children,
  open,
}: {
  children: React.ReactNode;
  open: boolean;
}) => {
  return (
    <div>
      {open && <div id="portal"></div>}
      {children}
    </div>
  );
};
