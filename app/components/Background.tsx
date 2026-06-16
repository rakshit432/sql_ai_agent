export function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Deep dark space background */}
      <div className="absolute inset-0 bg-[#060608]" />

      {/* Cyber Grid pattern */}
      <div className="absolute inset-0 cyber-grid opacity-[0.15] animate-grid-drift" />

      {/* Futuristic Scanlines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060608]/5 to-[#060608]/20 bg-[size:100%_4px]" />

      {/* Floating Neon Mesh Spheres */}
      <div className="absolute -top-[10%] left-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-[120px] animate-orb-1" />
      <div className="absolute top-[25%] -right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-500/12 via-indigo-500/5 to-transparent blur-[100px] animate-orb-2" />
      <div className="absolute -bottom-[10%] left-[20%] h-[550px] w-[550px] rounded-full bg-gradient-to-r from-purple-600/10 via-pink-600/5 to-transparent blur-[110px] animate-orb-3" />

      {/* Soft spotlight radial mask to focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,transparent_40%,#060608_100%)]" />
    </div>
  );
}
