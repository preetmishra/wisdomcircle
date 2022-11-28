import { useSelector } from "react-redux";
import Modal, { ModalBody, ModalCloseButton, ModalHeader } from "../Modal";

export default function VerificationNotificationModal({ shouldShow, onClose }) {
  const email = useSelector((state) => state.auth.user?.email);
  const phone = useSelector((state) => state.auth.user?.phone);

  if (!shouldShow) {
    return null;
  }

  return (
    <Modal>
      <ModalHeader>
        <p className="font-semibold text-neutral-black text-xl md:text-2xl">
          Verify Email and Phone
        </p>
        <ModalCloseButton onClose={onClose} />
      </ModalHeader>
      <ModalBody>
        <p className="text-neutral-grey">
          Please verify your account. We have sent an email to <b>{email}</b>{" "}
          and a message to <b>{phone}</b>. If you are unable to find them,
          please contact us at: <b>+91-9380644532</b>
        </p>
      </ModalBody>
    </Modal>
  );
}
