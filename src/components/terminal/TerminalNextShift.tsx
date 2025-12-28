import type { Dayjs } from 'dayjs';
import { CONFIG } from '../../utils/config';
import { calculateShift, getNextShift, getShiftCode } from '../../utils/shiftCalculations';
import { getShiftColor, getShiftEmoji } from './terminalUtils';

interface TerminalNextShiftProps {
  selectedTeam: number;
  fromDate: Dayjs;
}

/**
 * Render a terminal-style view showing the current shift and the next scheduled working shift for a team.
 *
 * @param selectedTeam - Team identifier used to look up shifts
 * @param fromDate - Reference date used to compute current and next shifts
 * @returns The React element containing current shift details and either the next shift information or an error message when no upcoming shift is found
 */
export default function TerminalNextShift({ selectedTeam, fromDate }: TerminalNextShiftProps) {
  const currentShift = calculateShift(fromDate, selectedTeam);
  const currentCode = getShiftCode(fromDate, selectedTeam);
  const nextShift = getNextShift(fromDate, selectedTeam);

  const currentShiftColor = getShiftColor(currentShift.code);
  const currentEmoji = getShiftEmoji(currentShift.code);

  // Hoist next shift display variables for better readability
  const nextShiftColor = nextShift ? getShiftColor(nextShift.shift.code) : '';
  const nextShiftEmoji = nextShift ? getShiftEmoji(nextShift.shift.code) : '';

  return (
    <div>
      <div className="mb-1">
        <span className="terminal-text bold cyan">Team {selectedTeam} - Shift Information</span>
      </div>

      <div className="terminal-info-box">
        <div className="terminal-info-row">
          <span className="terminal-text bold">
            Current Status ({fromDate.format('MMM D, YYYY')})
          </span>
        </div>
        <div className="terminal-info-row">
          <span className="terminal-text">
            {currentEmoji}{' '}
            <span className={`terminal-text bold ${currentShiftColor}`}>{currentShift.name}</span> -{' '}
            {currentShift.hours}
          </span>
        </div>
        <div className="terminal-info-row">
          <span className="terminal-text dim">Code: </span>
          <span className={`terminal-text bold ${currentShiftColor}`}>{currentCode}</span>
        </div>
      </div>

      {nextShift ? (
        <div className="terminal-info-box success">
          <div className="terminal-info-row">
            <span className="terminal-text bold green">Next Working Shift</span>
          </div>
          <div className="terminal-info-row">
            <span className="terminal-text">
              {nextShiftEmoji}{' '}
              <span className={`terminal-text bold ${nextShiftColor}`}>{nextShift.shift.name}</span>
            </span>
          </div>
          <div className="terminal-info-row">
            <span className="terminal-text dim">Date: </span>
            <span className="terminal-text bold">
              {nextShift.date.format('dddd, MMMM D, YYYY')}
            </span>
          </div>
          <div className="terminal-info-row">
            <span className="terminal-text dim">Hours: </span>
            <span className="terminal-text">{nextShift.shift.hours}</span>
          </div>
          <div className="terminal-info-row">
            <span className="terminal-text dim">Code: </span>
            <span className={`terminal-text bold ${nextShiftColor}`}>{nextShift.code}</span>
          </div>
          <div className="terminal-info-row mt-05">
            <span className="terminal-text dim">
              Days until next shift:{' '}
              <span className="terminal-text bold">{nextShift.date.diff(fromDate, 'day')}</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="terminal-info-box error">
          <span className="terminal-text red">
            No upcoming shift found within the next {CONFIG.SHIFT_CYCLE_DAYS} days.
          </span>
        </div>
      )}
    </div>
  );
}
