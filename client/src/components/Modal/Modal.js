import Portal from "../../common/Portal";
import ModalOverlay from "./ModalOverlay";

export function Modal({ children }) {
  return (
    <Portal selector={"#root-modal"}>
      <ModalOverlay />
      <div className="fixed inset-0 flex items-end md:items-center justify-center">
        <div className="bg-white h-auto md:max-w-md rounded-t-2xl md:rounded-lg overflow-y-auto max-h-[90vh]">
          {children}
        </div>
      </div>
    </Portal>
  );
}
