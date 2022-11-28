export default function ModalHeader({ children }) {
  return (
    <div className="border-b p-3 md:p-6 flex items-center justify-between border-neutral-divider">
      {children}
    </div>
  );
}
