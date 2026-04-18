import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, onChange }: { code: string; onChange: (value: string | undefined) => void }) {
  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={onChange}
        options={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
}
