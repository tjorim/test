import { useEffect, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import { CONFIG } from "../utils/config";

type WizardStep = "welcome" | "features" | "team-selection";

interface WelcomeWizardProps {
  show: boolean;
  onTeamSelect: (team: number) => void;
  onSkip?: () => void;
  onHide: () => void;
  isLoading?: boolean;
  startStep?: WizardStep;
}

/**
 * Present a three-step onboarding modal that guides users through welcome, feature highlights and team selection.
 *
 * @param show - Whether the wizard modal is visible
 * @param onTeamSelect - Called with the chosen team number when a team button is selected
 * @param onSkip - Optional callback invoked when the user chooses to browse all teams instead of selecting one
 * @param onHide - Called to request the wizard be hidden
 * @param isLoading - When true, disables interactions and displays a setup spinner
 * @param startStep - Initial step to show when the wizard opens ("welcome" | "features" | "team-selection")
 * @returns The WelcomeWizard React element
 */
export function WelcomeWizard({
  show,
  onTeamSelect,
  onSkip,
  onHide,
  isLoading = false,
  startStep = "welcome",
}: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(startStep);
  const initialStepRef = useRef(startStep);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Sync currentStep when startStep prop changes
  useEffect(() => {
    if (startStep !== initialStepRef.current) {
      setCurrentStep(startStep);
      initialStepRef.current = startStep;
    }
  }, [startStep]);

  const teams = Array.from({ length: CONFIG.TEAMS_COUNT }, (_, i) => i + 1);

  const SETTINGS_LOCATION_TEXT = "Settings panel (⚙️ in the top right)";

  const getStepNumber = () => {
    switch (currentStep) {
      case "welcome":
        return "1";
      case "features":
        return "2";
      case "team-selection":
        return "3";
      default:
        return "1";
    }
  };

  // Reset to startStep when modal opens
  const handleModalEntered = () => {
    if (!isLoading) {
      setCurrentStep(initialStepRef.current);
      // Focus the first interactive element using ref
      if (firstButtonRef.current) {
        firstButtonRef.current.focus();
      }
    }
  };

  const handleTeamSelect = (team: number) => {
    onTeamSelect(team);
    // Don't call onHide() here - let the parent component handle modal hiding
  };

  const handleSkip = () => {
    onSkip?.();
    onHide();
  };

  const nextStep = () => {
    if (currentStep === "welcome") {
      setCurrentStep("features");
    } else if (currentStep === "features") {
      setCurrentStep("team-selection");
    }
  };

  const prevStep = () => {
    if (currentStep === "team-selection") {
      setCurrentStep("features");
    } else if (currentStep === "features") {
      setCurrentStep("welcome");
    }
  };

  const getProgressPercentage = () => {
    switch (currentStep) {
      case "welcome":
        return 33;
      case "features":
        return 66;
      case "team-selection":
        return 100;
      default:
        return 0;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "welcome":
        return "Welcome to Worktime! 👋";
      case "features":
        return "What can Worktime do? ✨";
      case "team-selection":
        return "Choose Your Experience 🎯";
      default:
        return "Welcome to Worktime";
    }
  };

  const renderWelcomeStep = () => (
    <>
      <div className="text-center mb-4">
        <div className="mb-3">
          <i className="bi bi-clock-history text-primary" style={{ fontSize: "3rem" }}></i>
        </div>
        <h4 className="text-primary mb-3">Welcome to Worktime!</h4>
        <p className="lead mb-3">
          Your personal 24/7 shift tracker and time-off planner for 5-team continuous operations
        </p>
        <p className="text-muted">
          Worktime helps you stay on top of your shift schedule with real-time tracking, countdown
          timers, and integrated time-off management - all offline-capable!
        </p>
      </div>
      <div className="d-flex justify-content-between">
        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={isLoading}
          ref={currentStep === "welcome" ? firstButtonRef : undefined}
        >
          Maybe Later
        </Button>
        <Button variant="primary" onClick={nextStep} disabled={isLoading}>
          Let's Get Started! <i className="bi bi-arrow-right ms-1"></i>
        </Button>
      </div>
    </>
  );

  const renderFeaturesStep = () => (
    <>
      <div className="mb-4">
        <h5 className="text-center mb-4">Here's what Worktime can do for you:</h5>
        <Row className="g-3">
          <Col xs={12} md={6}>
            <div className="d-flex align-items-start">
              <i
                className="bi bi-stopwatch text-success me-3 mt-1"
                style={{ fontSize: "1.5rem" }}
              ></i>
              <div>
                <h6 className="mb-1">Live Countdown Timers</h6>
                <small className="text-muted">Know exactly when your next shift starts</small>
              </div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="d-flex align-items-start">
              <i className="bi bi-wifi-off text-info me-3 mt-1" style={{ fontSize: "1.5rem" }}></i>
              <div>
                <h6 className="mb-1">Works Offline</h6>
                <small className="text-muted">
                  No internet? No problem - fully functional offline
                </small>
              </div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="d-flex align-items-start">
              <i className="bi bi-people text-warning me-3 mt-1" style={{ fontSize: "1.5rem" }}></i>
              <div>
                <h6 className="mb-1">Team Overview</h6>
                <small className="text-muted">See who's working across all 5 teams</small>
              </div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="d-flex align-items-start">
              <i
                className="bi bi-calendar-check text-primary me-3 mt-1"
                style={{ fontSize: "1.5rem" }}
              ></i>
              <div>
                <h6 className="mb-1">Time-Off Planning</h6>
                <small className="text-muted">Track vacation and time-off with .hday files</small>
              </div>
            </div>
          </Col>
        </Row>
        <Alert variant="info" className="mt-4">
          <i className="bi bi-gear me-2"></i>
          <strong>Tip:</strong> You can customize your experience anytime in the{" "}
          <b>{SETTINGS_LOCATION_TEXT}</b>.
        </Alert>
      </div>
      <div className="d-flex justify-content-between">
        <Button
          variant="outline-secondary"
          onClick={prevStep}
          disabled={isLoading}
          ref={currentStep === "features" ? firstButtonRef : undefined}
        >
          <i className="bi bi-arrow-left me-1"></i> Back
        </Button>
        <Button variant="primary" onClick={nextStep} disabled={isLoading}>
          Choose My Team <i className="bi bi-arrow-right ms-1"></i>
        </Button>
      </div>
    </>
  );

  const renderTeamSelectionStep = () => (
    <>
      <div className="text-center mb-4">
        <h5 className="mb-3">How would you like to use Worktime?</h5>
        <p className="text-muted">You can always change this later in the app.</p>
      </div>

      <div className="mb-4">
        <h6 className="mb-3">Option 1: Select Your Team (Recommended)</h6>
        <p className="small text-muted mb-3">
          Get personalized features like countdown timers and shift progress tracking.
        </p>
        <Row className="g-2" aria-label="Select your team">
          {teams.map((team) => (
            <Col key={team} xs={6} sm={4} md={4}>
              <Button
                variant="outline-primary"
                className="w-100 team-btn"
                onClick={() => handleTeamSelect(team)}
                disabled={isLoading}
                aria-label={`Select Team ${team}`}
                ref={currentStep === "team-selection" && team === 1 ? firstButtonRef : undefined}
              >
                Team {team}
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      <hr />

      <div className="text-center">
        <h6 className="mb-2">Option 2: Browse All Teams</h6>
        <p className="small text-muted mb-3">
          View shift information for all teams without personalization.
        </p>
        <Button variant="outline-secondary" onClick={handleSkip} disabled={isLoading}>
          <i className="bi bi-eye me-1"></i>
          Browse All Teams
        </Button>
      </div>

      <div className="d-flex justify-content-start mt-3">
        <Button variant="outline-secondary" size="sm" onClick={prevStep} disabled={isLoading}>
          <i className="bi bi-arrow-left me-1"></i> Back
        </Button>
      </div>
    </>
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      onEntered={handleModalEntered}
    >
      <Modal.Header>
        <Modal.Title>{getStepTitle()}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Progress bar */}
        <div className="mb-4">
          <ProgressBar
            now={getProgressPercentage()}
            variant="primary"
            style={{ height: "4px" }}
            className="mb-2"
          />
          <div className="d-flex justify-content-between small text-muted">
            <span>Step {getStepNumber()} of 3</span>
            <span>{getProgressPercentage()}% Complete</span>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <div className="mt-3 text-muted">Setting up your experience...</div>
          </div>
        ) : (
          <>
            {currentStep === "welcome" && renderWelcomeStep()}
            {currentStep === "features" && renderFeaturesStep()}
            {currentStep === "team-selection" && renderTeamSelectionStep()}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}