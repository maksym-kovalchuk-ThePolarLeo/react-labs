import { startTransition, useActionState, useRef } from 'react'
import { useForm, useSelector } from '@tanstack/react-form'
import { safeParse } from 'valibot'
import GuestsStepper from './GuestsStepper.jsx'
import { sendBooking } from '../api.js'
import { bookingSchema, maxBookingDate, today } from '../bookingSchema.js'

const defaultValues = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: 2,
  comment: '',
}

const FOCUS_ORDER = ['name', 'phone', 'date', 'time']

// Повторює режим onTouched: уперше поле перевіряється при втраті фокусу,
// а далі (після blur або першої спроби надсилання) — при кожній зміні.
// Поле date також переперевіряє форму при зміні, щоб одразу оновити time.
function onTouchedValidationLogic({ event, form, validators, runValidation }) {
  if (!validators || event.async) {
    return runValidation({ validators: [], form })
  }
  const fieldMeta = event.fieldName ? form.getFieldMeta(event.fieldName) : null
  const shouldValidate =
    event.type === 'submit' ||
    event.type === 'blur' ||
    (event.type === 'change' &&
      (form.state.submissionAttempts > 0 ||
        fieldMeta?.isBlurred ||
        event.fieldName === 'date'))
  return runValidation({
    validators: shouldValidate
      ? [{ fn: validators.onDynamic, cause: 'dynamic' }]
      : [],
    form,
  })
}

export default function BookingForm() {
  const fieldRefs = useRef({})
  const [result, dispatch, isPending] = useActionState(bookTable, null)

  const form = useForm({
    defaultValues,
    validationLogic: onTouchedValidationLogic,
    validators: {
      onDynamic: bookingSchema,
    },
    onSubmitInvalid: ({ value }) => {
      const parsed = safeParse(bookingSchema, value)
      if (parsed.success) return
      const invalidFields = new Set(
        parsed.issues.map((issue) => issue.path?.[0]?.key).filter(Boolean),
      )
      const firstInvalid = FOCUS_ORDER.find((name) => invalidFields.has(name))
      if (firstInvalid) fieldRefs.current[firstInvalid]?.focus()
    },
    onSubmit: ({ value }) => {
      if (isPending) return
      const parsed = safeParse(bookingSchema, value)
      if (!parsed.success) return
      startTransition(() => dispatch(parsed.output))
    },
  })

  const submissionAttempts = useSelector(
    form.store,
    (state) => state.submissionAttempts,
  )

  // Дія для useActionState: null — сигнал «Очистити»; інакше надсилаємо
  // бронювання, після успіху очищаємо форму й повертаємо відповідь.
  async function bookTable(previousResult, booking) {
    if (booking === null) return null
    const response = await sendBooking(booking)
    if (response.ok) startTransition(() => form.reset())
    return response
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.currentTarget.requestSubmit()
    }
  }

  function handleReset() {
    form.reset()
    fieldRefs.current.name?.focus()
    startTransition(() => dispatch(null))
  }

  function getFieldError(field) {
    const show = field.state.meta.isBlurred || submissionAttempts > 0
    if (!show) return undefined
    const firstError = field.state.meta.errors[0]
    return typeof firstError === 'string' ? firstError : firstError?.message
  }

  return (
    <form
      className="booking-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      onKeyDown={handleKeyDown}
    >
      <form.Field name="name">
        {(field) => {
          const errorMessage = getFieldError(field)
          return (
            <div className="field">
              <label>
                Ім&apos;я
                <input
                  ref={(el) => {
                    fieldRefs.current.name = el
                  }}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="name"
                  required
                  aria-invalid={errorMessage ? 'true' : 'false'}
                  aria-describedby="name-error"
                />
              </label>
              <p id="name-error" className="field-error">
                {errorMessage}
              </p>
            </div>
          )
        }}
      </form.Field>
      <form.Field name="phone">
        {(field) => {
          const errorMessage = getFieldError(field)
          return (
            <div className="field">
              <label>
                Телефон
                <input
                  ref={(el) => {
                    fieldRefs.current.phone = el
                  }}
                  type="tel"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="tel"
                  placeholder="+380671234567"
                  required
                  aria-invalid={errorMessage ? 'true' : 'false'}
                  aria-describedby="phone-error"
                />
              </label>
              <p id="phone-error" className="field-error">
                {errorMessage}
              </p>
            </div>
          )
        }}
      </form.Field>
      <div className="row">
        <form.Field name="date">
          {(field) => {
            const errorMessage = getFieldError(field)
            return (
              <div className="field">
                <label>
                  Дата
                  <input
                    ref={(el) => {
                      fieldRefs.current.date = el
                    }}
                    type="date"
                    min={today()}
                    max={maxBookingDate()}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    aria-invalid={errorMessage ? 'true' : 'false'}
                    aria-describedby="date-error"
                  />
                </label>
                <p id="date-error" className="field-error">
                  {errorMessage}
                </p>
              </div>
            )
          }}
        </form.Field>
        <form.Field name="time">
          {(field) => {
            const errorMessage = getFieldError(field)
            return (
              <div className="field">
                <label>
                  Час
                  <input
                    ref={(el) => {
                      fieldRefs.current.time = el
                    }}
                    type="time"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    aria-invalid={errorMessage ? 'true' : 'false'}
                    aria-describedby="time-error"
                  />
                </label>
                <p id="time-error" className="field-error">
                  {errorMessage}
                </p>
              </div>
            )
          }}
        </form.Field>
      </div>
      <form.Field name="guests">
        {(field) => (
          <GuestsStepper
            value={field.state.value}
            onChange={field.handleChange}
          />
        )}
      </form.Field>
      <form.Field name="comment">
        {(field) => (
          <label>
            Коментар
            <textarea
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              maxLength={200}
              aria-describedby="comment-counter"
            />
          </label>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.values.comment}>
        {(comment) => (
          <p id="comment-counter" className="counter">
            {comment.length} / 200
          </p>
        )}
      </form.Subscribe>
      <div className="actions">
        <button type="submit" aria-disabled={isPending}>
          {isPending ? 'Надсилаємо…' : 'Забронювати'}
        </button>
        <button type="button" onClick={handleReset}>
          Очистити
        </button>
      </div>
      <p
        role="status"
        className={result?.ok === false ? 'status error' : 'status'}
      >
        {result?.message}
      </p>
    </form>
  )
}
