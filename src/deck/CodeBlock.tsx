import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export function CodeBlock({
  code,
  language,
  filename,
  typewriter = false,
}: {
  code: string;
  language: string;
  filename: string;
  typewriter?: boolean;
}) {
  const [html, setHtml] = useState<string>("");
  const [visibleLines, setVisibleLines] = useState(typewriter ? 0 : Infinity);

  useEffect(() => {
    let active = true;
    codeToHtml(code, {
      lang: language,
      theme: "github-dark-default",
    }).then((h) => {
      if (active) setHtml(h);
    });
    return () => {
      active = false;
    };
  }, [code, language]);

  useEffect(() => {
    if (!typewriter) return;
    const lines = code.split("\n").length;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setVisibleLines(i);
      if (i >= lines) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [code, typewriter]);

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <span className="h-3 w-3 rounded-full bg-[oklch(0.65_0.22_25)]" />
        <span className="h-3 w-3 rounded-full bg-[oklch(0.82_0.17_85)]" />
        <span className="h-3 w-3 rounded-full bg-[oklch(0.78_0.2_145)]" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">
          {filename}
        </span>
      </div>
      <div
        className="text-[15px] leading-relaxed font-mono p-6 overflow-auto max-h-[60vh] [&_pre]:!bg-transparent [&_pre]:!p-0"
        style={{
          maskImage:
            visibleLines === Infinity
              ? "none"
              : `linear-gradient(180deg, #000 ${visibleLines * 1.55}em, transparent ${visibleLines * 1.55}em)`,
        }}
        dangerouslySetInnerHTML={{ __html: html || `<pre>${escape(code)}</pre>` }}
      />
    </div>
  );
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
