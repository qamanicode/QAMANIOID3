export default function Sidebar() {
  return (
    <div className="w-64 bg-card-background border-r border-border h-full p-4">
      <h2 className="text-sm font-semibold text-text mb-4">Files</h2>
      <div className="text-muted text-sm space-y-2">
        <div className="flex items-center gap-2"><span className="text-primary">📄</span> main.py</div>
        <div className="flex items-center gap-2">📄 utils.py</div>
      </div>
    </div>
  );
}
