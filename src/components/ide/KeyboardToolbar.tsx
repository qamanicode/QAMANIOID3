export default function KeyboardToolbar({ onInsert }: { onInsert: (symbol: string) => void }) {
  const symbols = ['(', ')', ':', '[', ']', '{', '}', '=', '+'];
  return (
    <div className="flex bg-card-background border-t border-border overflow-x-auto p-2 gap-2">
      {symbols.map(s => (
        <button key={s} onClick={() => onInsert(s)} className="px-3 py-1 bg-background rounded-md text-text hover:bg-primary transition">{s}</button>
      ))}
    </div>
  );
}
