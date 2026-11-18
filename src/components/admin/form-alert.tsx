export function FormAlert({
  error,
  message,
  fieldErrors,
}: {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}) {
  const firstFieldError = fieldErrors
    ? Object.values(fieldErrors).flat().filter(Boolean)[0]
    : undefined;
  const text = error || firstFieldError;

  if (!text && !message) return null;

  return (
    <div
      role={text ? "alert" : "status"}
      className={
        text
          ? "border border-[#9b2c2c]/30 bg-[#f9e9e7] px-4 py-3 text-sm text-[#8a3229]"
          : "border border-[#4f7a55]/30 bg-[#e8f0e6] px-4 py-3 text-sm text-[#35553a]"
      }
    >
      {text || message}
    </div>
  );
}

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="field-error">{messages[0]}</p>;
}
