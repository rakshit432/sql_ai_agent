export function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#030303]" />

      <div
        className="absolute inset-0 opacity-[0.35] animate-grid-drift"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-float" />
      <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[100px] animate-float-delayed" />
      <div className="absolute -bottom-20 left-1/3 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[90px] animate-float" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent_70%)]" />
    </div>
  );
}
