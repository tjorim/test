import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface UpdateAvailableModalProps {
  show: boolean;
  onUpdate: () => void;
  onLater: () => void;
}

/**
 * Modal that prompts users when an app update is available
 */
export function UpdateAvailableModal({ show, onUpdate, onLater }: UpdateAvailableModalProps) {
  return (
    <Modal show={show} onHide={onLater} centered backdrop="static">
      <Modal.Header>
        <Modal.Title>
          <i className="bi bi-download me-2 text-primary"></i>
          Update Available
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <p className="mb-3">
            A new version of NextShift is available with improvements and bug fixes.
          </p>
          <p className="text-muted mb-0">
            The update will be applied immediately and the app will refresh.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onLater}>
          Later
        </Button>
        <Button variant="primary" onClick={onUpdate}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Update Now
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
