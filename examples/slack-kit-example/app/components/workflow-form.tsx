"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

export default function WorkflowForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const ref = useRef<HTMLFormElement>(null);
  function SubmitButton() {
    const status = useFormStatus();
    return (
      <button
        className="mt-2 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        type="submit"
        disabled={status.pending}
      >
        {status.pending ? "Knock On 🤘" : "Trigger Workflow"}
      </button>
    );
  }
  return (
    <form
      className="block"
      action={async (formData: FormData) => {
        await action(formData);
        ref.current?.reset();
      }}
      ref={ref}
    >
      <textarea
        className="w-full border-slate-400 rounded border shadow-sm p-2"
        name="message"
        id=""
        placeholder="Type your message here."
        required
      ></textarea>
      <SubmitButton></SubmitButton>
    </form>
  );
}
