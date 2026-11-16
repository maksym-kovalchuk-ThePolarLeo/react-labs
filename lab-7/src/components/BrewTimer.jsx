import { useEffect, useState } from 'react'
import TimerView from './TimerView.jsx'

export default function BrewTimer({ method }) {
  const [secondsLeft, setSecondsLeft] = useState(method.seconds)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return
    setInterval(() => {
      setSecondsLeft(secondsLeft - 1)
    }, 1000)
  }, [isRunning])

  let status = 'paused'
  if (secondsLeft === 0) {
    status = 'done'
  } else if (isRunning) {
    status = 'running'
  } else if (secondsLeft === method.seconds) {
    status = 'idle'
  }

  return (
    <TimerView
      method={method}
      secondsLeft={secondsLeft}
      status={status}
      onStart={() => setIsRunning(true)}
      onPause={() => setIsRunning(false)}
      onReset={() => {
        setIsRunning(false)
        setSecondsLeft(method.seconds)
      }}
    />
  )
}
