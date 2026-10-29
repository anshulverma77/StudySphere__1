interface AnimatedBackgroundProps {
  variant?: 'hero' | 'auth' | 'subtle';
  className?: string;
}

export function AnimatedBackground({
  variant = 'hero',
  className = '',
}: AnimatedBackgroundProps) {
  if (variant === 'auth') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[100px] animate-float-medium" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-teal-500/10 blur-[80px] animate-float-fast" />
      </div>
    );
  }

  if (variant === 'subtle') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-200/30 blur-[100px] animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-cyan-200/20 blur-[80px] animate-float-medium" />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Aurora gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/25 blur-[120px] animate-float-slow" />
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[100px] animate-float-medium" />
      <div className="absolute bottom-[-20%] left-[30%] w-[450px] h-[450px] rounded-full bg-teal-500/15 blur-[110px] animate-float-fast" />
      <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] animate-float-slow" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
