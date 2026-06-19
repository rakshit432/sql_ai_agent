'use client';

export function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Deep matte black base */}
      <div className="absolute inset-0 bg-[#030303]" />

      {/* Modern fine grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

      {/* Floating high-fidelity color orbs */}
      <div className="absolute -top-[10%] left-[10%] h-[350px] w-[350px] rounded-full bg-indigo-500/8 blur-[100px] animate-orb-1" />
      <div className="absolute top-[35%] -right-[5%] h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[120px] animate-orb-2" />
      <div className="absolute -bottom-[10%] left-[20%] h-[350px] w-[350px] rounded-full bg-cyan-500/6 blur-[110px] animate-orb-3" />

      {/* Subtle radial overlay spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.04),transparent_60%)]" />
    </div>
  );
}
