"use client";

type DeleteButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  entityLabel: string;
};

export function DeleteButton({ action, id, entityLabel }: DeleteButtonProps) {
  return (
    <form action={action} onSubmit={(event) => { if (!window.confirm(`Excluir ${entityLabel}? Esta ação não pode ser desfeita.`)) event.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="min-h-10 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50">Excluir</button>
    </form>
  );
}
