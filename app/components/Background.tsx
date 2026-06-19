'use client';

export function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Matte dark zinc-950 base */}
      <div className="absolute inset-0 bg-[#09090b]" />

      {/* Modern thin technical grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_80%,transparent_100%)] opacity-80" />
    </div>
  );
}
