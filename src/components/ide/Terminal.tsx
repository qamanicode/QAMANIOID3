export default function Terminal({ output }: { output: string }) {
  return (
    <div className="h-48 bg-background border-t border-border p-4 font-mono text-sm text-text overflow-y-auto">
      <div className="text-primary mb-2">$ QAMANIOID3 Terminal</div>
      <pre>{output || "Ready to execute..."}</pre>
    </div>
  );
}
