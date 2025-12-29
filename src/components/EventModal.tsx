import type { RefObject } from "react";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import type { EventFlag, TimeLocationFlag, TypeFlag } from "../lib/hday/types";
import { getEventTypeLabel } from "../lib/hday/parser";
import { getWeekdayName } from "../utils/dateTimeUtils";

type FlagCheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  name: string;
  type?: "checkbox" | "radio";
};

function FlagCheckbox({
  id,
  label,
  checked,
  onChange,
  name,
  type = "checkbox",
}: FlagCheckboxProps) {
  return (
    <Form.Check
      id={id}
      name={name}
      type={type}
      label={label}
      checked={checked}
      onChange={onChange}
    />
  );
}

type EventModalProps = {
  show: boolean;
  editIndex: number;
  formRef: RefObject<HTMLDivElement | null>;
  eventType: "range" | "weekly";
  eventWeekday: number;
  eventStart: string;
  eventEnd: string;
  eventTitle: string;
  eventFlags: EventFlag[];
  startDateError: string;
  endDateError: string;
  previewLine: string;
  typeFlagOptions: Array<[TypeFlag | "none", string]>;
  timeLocationFlagOptions: Array<[TimeLocationFlag | "none", string]>;
  typeFlagsAsEventFlags: ReadonlyArray<EventFlag>;
  timeLocationFlagsAsEventFlags: ReadonlyArray<EventFlag>;
  onHide: () => void;
  onEntered: () => void;
  onEventTypeChange: (value: "range" | "weekly") => void;
  onEventTitleChange: (value: string) => void;
  onEventWeekdayChange: (value: number) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onTypeFlagChange: (flag: TypeFlag | "none") => void;
  onTimeFlagChange: (flag: TimeLocationFlag | "none") => void;
  onResetForm: () => void;
  onSubmit: () => void;
};

/**
 * Event Modal Component
 *
 * Accessibility Features:
 * - Modal.Header closeButton provides keyboard-accessible close (Escape key, X button)
 * - All form inputs have associated <Form.Label> elements for screen readers
 * - Required fields marked with aria-required="true" and visual * indicator
 * - Form validation errors use aria-describedby to link error messages to inputs
 * - Live preview section provides immediate feedback on event formatting
 * - Form.Check components (checkboxes/radios) have proper label associations
 * - Semantic HTML structure with proper heading hierarchy
 * - Focus trap built into React Bootstrap Modal component
 * - Modal backdrop click and Escape key both trigger onHide for flexibility
 */
export function EventModal({
  show,
  editIndex,
  formRef,
  eventType,
  eventWeekday,
  eventStart,
  eventEnd,
  eventTitle,
  eventFlags,
  startDateError,
  endDateError,
  previewLine,
  typeFlagOptions,
  timeLocationFlagOptions,
  typeFlagsAsEventFlags,
  timeLocationFlagsAsEventFlags,
  onHide,
  onEntered,
  onEventTypeChange,
  onEventTitleChange,
  onEventWeekdayChange,
  onStartDateChange,
  onEndDateChange,
  onTypeFlagChange,
  onTimeFlagChange,
  onResetForm,
  onSubmit,
}: EventModalProps) {
  return (
    <Modal show={show} onHide={onHide} onEntered={onEntered} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{editIndex >= 0 ? "Edit event" : "New event"}</Modal.Title>
      </Modal.Header>
      <Modal.Body ref={formRef}>
        <Form>
          <Row className="g-3">
            <Col xs={12}>
              <Card className="preview-card border-0 bg-light">
                <Card.Body className="py-2">
                  <div className="small text-uppercase text-muted">Preview</div>
                  <div className="fw-semibold">
                    {getEventTypeLabel(eventFlags)}{" "}
                    {eventType === "weekly"
                      ? eventWeekday
                        ? `· ${getWeekdayName(eventWeekday)}`
                        : ""
                      : eventStart
                        ? eventEnd && eventEnd !== eventStart
                          ? `· ${eventStart} → ${eventEnd}`
                          : `· ${eventStart}`
                        : "· Select a date"}
                  </div>
                  {eventTitle && <div className="text-muted">{eventTitle}</div>}
                  {eventFlags.length > 0 && (
                    <div className="text-muted small">Flags: {eventFlags.join(", ")}</div>
                  )}
                  <div className="mt-2">
                    <div className="small text-uppercase text-muted">Raw line</div>
                    <div className="font-monospace">
                      {previewLine || "Fill in the required fields to preview the .hday line."}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Form.Group controlId="eventType">
                <Form.Label>Event type</Form.Label>
                <Form.Select
                  value={eventType}
                  onChange={(event) => onEventTypeChange(event.target.value as "range" | "weekly")}
                >
                  <option value="range">Range (start-end)</option>
                  <option value="weekly">Weekly (weekday)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="eventTitle">
                <Form.Label>Comment (optional)</Form.Label>
                <Form.Control
                  aria-label="Comment"
                  value={eventTitle}
                  onChange={(event) => onEventTitleChange(event.target.value)}
                  placeholder="Optional comment"
                />
              </Form.Group>
            </Col>

            {eventType === "range" ? (
              <>
                <Col md={6}>
                  <Form.Group controlId="eventStart">
                    <Form.Label>
                      Start (YYYY/MM/DD) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={eventStart ? eventStart.replace(/\//g, "-") : ""}
                      onChange={(event) =>
                        onStartDateChange(
                          event.target.value ? event.target.value.replace(/-/g, "/") : "",
                        )
                      }
                      isInvalid={!!startDateError}
                      aria-required="true"
                      aria-describedby={startDateError ? "eventStart-error" : undefined}
                    />
                    {startDateError && (
                      <Form.Control.Feedback type="invalid" id="eventStart-error">
                        {startDateError}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="eventEnd">
                    <Form.Label>End (YYYY/MM/DD)</Form.Label>
                    <Form.Control
                      type="date"
                      value={eventEnd ? eventEnd.replace(/\//g, "-") : ""}
                      onChange={(event) =>
                        onEndDateChange(
                          event.target.value ? event.target.value.replace(/-/g, "/") : "",
                        )
                      }
                      isInvalid={!!endDateError}
                      aria-describedby={endDateError ? "eventEnd-error" : undefined}
                    />
                    {endDateError && (
                      <Form.Control.Feedback type="invalid" id="eventEnd-error">
                        {endDateError}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </>
            ) : (
              <Col md={6}>
                <Form.Group controlId="eventWeekday">
                  <Form.Label>Weekday</Form.Label>
                  <Form.Select
                    value={eventWeekday}
                    onChange={(event) => onEventWeekdayChange(parseInt(event.target.value, 10))}
                  >
                    <option value="1">Mon</option>
                    <option value="2">Tue</option>
                    <option value="3">Wed</option>
                    <option value="4">Thu</option>
                    <option value="5">Fri</option>
                    <option value="6">Sat</option>
                    <option value="7">Sun</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            <Col xs={12}>
              <fieldset className="border rounded p-3">
                <legend className="float-none w-auto px-2 fs-6">Type Flags</legend>
                <Row className="g-2">
                  {typeFlagOptions.map(([flag, label]) => (
                    <Col sm={6} lg={4} key={flag}>
                      <FlagCheckbox
                        id={`type-flag-${flag}`}
                        name="type-flag"
                        type="radio"
                        label={label}
                        checked={
                          flag === "none"
                            ? !eventFlags.some((flagValue) =>
                                typeFlagsAsEventFlags.includes(flagValue),
                              )
                            : eventFlags.includes(flag)
                        }
                        onChange={() => onTypeFlagChange(flag)}
                      />
                    </Col>
                  ))}
                </Row>
              </fieldset>
            </Col>

            <Col xs={12}>
              <fieldset className="border rounded p-3">
                <legend className="float-none w-auto px-2 fs-6">Time / Location Flags</legend>
                <Row className="g-2">
                  {timeLocationFlagOptions.map(([flag, label]) => (
                    <Col sm={6} lg={4} key={flag}>
                      <FlagCheckbox
                        id={`time-flag-${flag}`}
                        name="time-flag"
                        type="radio"
                        label={label}
                        checked={
                          flag === "none"
                            ? !eventFlags.some((flagValue) =>
                                timeLocationFlagsAsEventFlags.includes(flagValue),
                              )
                            : eventFlags.includes(flag)
                        }
                        onChange={() => onTimeFlagChange(flag)}
                      />
                    </Col>
                  ))}
                </Row>
              </fieldset>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onResetForm}>
          Reset form
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          {editIndex >= 0 ? "Update" : "Add"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
