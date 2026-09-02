"use client"

export const ENGRAVING_MAX_LENGTH = 40

const EngravingInput = ({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) => {
  const used = value.trim().length
  const over = used > ENGRAVING_MAX_LENGTH

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor="engraving"
          className="text-base-semi text-brand-primary"
        >
          Add an engraving
          <span className="text-base-regular text-ui-fg-muted"> (optional)</span>
        </label>
        <span
          className={
            over
              ? "text-small-regular text-brand-accent"
              : "text-small-regular text-ui-fg-muted"
          }
          data-testid="engraving-counter"
        >
          {used}/{ENGRAVING_MAX_LENGTH}
        </span>
      </div>

      <input
        id="engraving"
        name="engraving"
        type="text"
        value={value}
        disabled={disabled}
        maxLength={ENGRAVING_MAX_LENGTH * 2}
        onChange={(e) => onChange(e.target.value)}
        placeholder="For Aama, 2026"
        data-testid="engraving-input"
        className="w-full rounded-rounded border border-ui-border-base bg-white px-4 py-3 text-base-regular text-brand-slate placeholder:text-ui-fg-muted focus:border-brand-primary focus:outline-none transition-colors duration-150 disabled:opacity-50"
      />

      {over ? (
        <p className="text-small-regular text-brand-accent">
          {used - ENGRAVING_MAX_LENGTH} character
          {used - ENGRAVING_MAX_LENGTH === 1 ? "" : "s"} too long.
        </p>
      ) : (
        <p className="text-small-regular text-ui-fg-muted">
          Hand-engraved in Kathmandu. Adds 2-3 days and cannot be returned.
        </p>
      )}
    </div>
  )
}

export default EngravingInput
