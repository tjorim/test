import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary' | 'warning';
}

/**
 * Displays an accessible confirmation dialog when open.
 *
 * The dialog uses React Bootstrap Modal for consistent styling and accessibility.
 * It can be dismissed by clicking the backdrop or pressing the Escape key, and provides confirm and cancel action buttons.
 *
 * @param isOpen - Whether the dialog is currently open; when false, nothing is rendered.
 * @param title - The title text displayed at the top of the dialog.
 * @param message - The main message or description shown inside the dialog body.
 * @param confirmLabel - Optional label for the primary confirm button (defaults to "Confirm").
 * @param cancelLabel - Optional label for the secondary cancel button (defaults to "Cancel").
 * @param onConfirm - Callback invoked when the confirm button is clicked.
 * @param onCancel - Callback invoked when the dialog is dismissed (cancel button, backdrop click, or Escape key).
 * @param variant - Button variant for the confirm button (defaults to "primary").
 * @returns The dialog's JSX element when `isOpen` is true, otherwise `null`.
 */
export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary',
}: ConfirmationDialogProps) {
  return (
    <Modal show={isOpen} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
