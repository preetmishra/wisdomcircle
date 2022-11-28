import Close from "../assets/icons/Icon";

export default function ModalCloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      className="bg-neutral-light rounded-full p-2 hover:bg-neutral-divider"
    >
      <Close className="w-6 h-6 text-neutral-charcoal" />
    </button>
  );
}
