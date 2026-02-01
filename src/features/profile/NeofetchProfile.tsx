function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="text-primary min-w-[100px] md:min-w-[140px] font-bold">{label}</span>
      <span className="text-foreground break-all">{value}</span>
    </div>
  );
}

export function NeofetchProfile() {
  const info = {
    user: "kotaitos",
    role: "Machine Learning Engineer",
    location: "Tokyo, Japan",
    os: "macOS / Ubuntu",
    languages: "TypeScript, Python",
    editor: "VS Code / Cursor",
    shell: "zsh",
    uptime: "2 years (active development)",
  };

  return (
    <div className="w-full font-mono mt-4 md:mt-6 select-text">
      <h2 className="text-xs font-bold mb-3 uppercase tracking-tighter opacity-40">
        &gt; System.Profile.Fetch
      </h2>
      <div className="border-l border-border/50 pl-3 ml-1 text-[11px] leading-tight">
        <div className="flex flex-col md:flex-row gap-4 md:gap-10 items-start">
          <div className="flex-1 space-y-0.5 pt-2">
            <InfoLine label="User:" value={info.user} />
            <InfoLine label="Role:" value={info.role} />
            <InfoLine label="Location:" value={info.location} />
            <InfoLine label="OS:" value={info.os} />
            <InfoLine label="Languages:" value={info.languages} />
            <InfoLine label="Editor:" value={info.editor} />
            <InfoLine label="Shell:" value={info.shell} />
            <InfoLine label="Uptime:" value={info.uptime} />
          </div>
        </div>
      </div>
    </div>
  );
}
