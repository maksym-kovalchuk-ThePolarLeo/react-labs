import { formatTime } from '../formatTime.js'

/**
 * Простий (presentational) компонент таймера: лише показує те, що отримав у
 * props, і викликає передані обробники. Власного стану й ефектів не має.
 *
 * Використання:
 *   <TimerView
 *     method={method}
 *     secondsLeft={175}
 *     status="running"   // 'idle' | 'running' | 'paused' | 'done'
 *     onStart={…}
 *     onPause={…}
 *     onReset={…}
 *   />
 *
 * Вимоги — у тестах tests/TimerView.test.jsx.
 */
export default function TimerView({
  method,
  secondsLeft,
  status,
  onStart,
  onPause,
  onReset,
}) {
  let primaryLabel = 'Старт'
  let primaryAction = onStart

  if (status === 'running') {
    primaryLabel = 'Пауза'
    primaryAction = onPause
  } else if (status === 'paused') {
    primaryLabel = 'Продовжити'
    primaryAction = onStart
  } else if (status === 'done') {
    primaryLabel = 'Спочатку'
    primaryAction = onReset
  }

  return (
    <article className="brew-timer" aria-labelledby={`${method.id}-title`}>
      <h3 id={`${method.id}-title`}>{method.name}</h3>
      <p>{method.recipe}</p>
      <p className="time" role="timer">
        {formatTime(secondsLeft)}
      </p>
      <p className="timer-done" role="status">
        {status === 'done' ? 'Готово! Час пити каву.' : ''}
      </p>
      <div className="timer-controls">
        <button type="button" onClick={primaryAction}>
          {primaryLabel}
        </button>
        {(status === 'running' || status === 'paused') && (
          <button type="button" onClick={onReset}>
            Скинути
          </button>
        )}
      </div>
    </article>
  )
}
