import type { Dayjs } from 'dayjs';

interface TerminalHeaderProps {
  currentTime: Dayjs;
}

/**
 * Renders a terminal-style header displaying the application title and the current date and time.
 *
 * @param currentTime - Dayjs instance used to format the displayed date and time
 * @returns A JSX element containing the title "⚡ Worktime TUI ⚡" and a subtitle with the formatted date and time
 */
export default function TerminalHeader({ currentTime }: TerminalHeaderProps) {
  const formattedDate = currentTime.format('dddd, MMMM D, YYYY');
  const formattedTime = currentTime.format('HH:mm:ss');

  return (
    <div className="terminal-header">
      <div className="terminal-title">⚡ Worktime TUI ⚡</div>
      <div className="terminal-subtitle">
        {formattedDate} • {formattedTime}
      </div>
    </div>
  );
}
