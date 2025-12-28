import type { Dayjs } from 'dayjs';
import { formatYYWWD } from '../../utils/dateTimeUtils';
import { getAllTeamsShifts, isCurrentlyWorking } from '../../utils/shiftCalculations';
import { getShiftColor, getShiftEmoji } from './terminalUtils';

interface TerminalTeamListProps {
  date: Dayjs;
  selectedTeam: number;
  currentTime: Dayjs;
}

/**
 * Render a terminal-style list of all team shifts for a given date.
 *
 * Displays a header with the formatted date and date code, then one row per team
 * showing team number, shift emoji and name, shift hours, shift code, and a
 * "← WORKING NOW" indicator when the team is currently working. The selected
 * team is visually highlighted.
 *
 * @param date - The Dayjs date for which to display team shifts
 * @param selectedTeam - The team number that should be shown as selected
 * @param currentTime - The current Dayjs time used to determine whether a shift is active
 * @returns The JSX element rendering the terminal-style team shift list
 */
export default function TerminalTeamList({
  date,
  selectedTeam,
  currentTime,
}: TerminalTeamListProps) {
  const teams = getAllTeamsShifts(date);
  const dateCode = formatYYWWD(date);
  const displayDate = date.format('dddd, MMMM D, YYYY');

  return (
    <div>
      <div className="terminal-date-header">
        📅 {displayDate} ({dateCode})
      </div>

      {teams.map((team) => {
        const isSelected = team.teamNumber === selectedTeam;
        const shiftColor = getShiftColor(team.shift.code);
        const emoji = getShiftEmoji(team.shift.code);
        const isWorking = isCurrentlyWorking(team.shift, date, currentTime);

        return (
          <div
            key={team.teamNumber}
            className={`terminal-team-row ${isSelected ? 'selected' : ''}`}
          >
            <span className="terminal-team-col name">
              {isSelected ? '▶ ' : '  '}Team {team.teamNumber}
            </span>
            <span className={`terminal-team-col shift terminal-text ${shiftColor}`}>
              {emoji} {team.shift.name}
            </span>
            <span className="terminal-team-col hours terminal-text dim">{team.shift.hours}</span>
            <span className="terminal-team-col code">
              <span className={`terminal-text bold ${shiftColor}`}>{team.code}</span>
              {isWorking && <span className="terminal-text green"> ← WORKING NOW</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
