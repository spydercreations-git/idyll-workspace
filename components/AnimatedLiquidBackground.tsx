import React from 'react';

const AnimatedLiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Main lava background - darker base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        
        {/* Large flowing lava blobs - darker blues */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-60 animate-lava-flow"
          style={{
            background: 'radial-gradient(circle at 30% 40%, #1e3a8a 0%, #1e40af 25%, #2563eb 50%, transparent 70%)',
            top: '-20%',
            left: '-10%',
            filter: 'blur(60px)',
            animationDelay: '0s',
            animationDuration: '20s'
          }}
        />
        
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-50 animate-lava-flow-reverse"
          style={{
            background: 'radial-gradient(circle at 60% 30%, #1e3a8a 0%, #1d4ed8 30%, #2563eb 60%, transparent 80%)',
            top: '20%',
            right: '-15%',
            filter: 'blur(50px)',
            animationDelay: '5s',
            animationDuration: '25s'
          }}
        />
        
        <div 
          className="absolute w-[700px] h-[700px] rounded-full opacity-40 animate-lava-pulse"
          style={{
            background: 'radial-gradient(circle at 40% 60%, #1d4ed8 0%, #2563eb 20%, #3b82f6 40%, #60a5fa 60%, transparent 80%)',
            bottom: '-20%',
            left: '20%',
            filter: 'blur(70px)',
            animationDelay: '10s',
            animationDuration: '30s'
          }}
        />
        
        {/* Medium flowing elements - darker */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-35 animate-lava-drift"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #1e3a8a 0%, #1d4ed8 40%, transparent 70%)',
            top: '60%',
            right: '30%',
            filter: 'blur(40px)',
            animationDelay: '3s',
            animationDuration: '18s'
          }}
        />
        
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-30 animate-lava-wave"
          style={{
            background: 'radial-gradient(circle at 70% 30%, #2563eb 0%, #3b82f6 30%, #60a5fa 50%, transparent 70%)',
            top: '10%',
            left: '40%',
            filter: 'blur(45px)',
            animationDelay: '7s',
            animationDuration: '22s'
          }}
        />
        
        {/* Small bubbling effects - darker */}
        <div 
          className="absolute w-[200px] h-[200px] rounded-full opacity-40 animate-lava-bubble"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, #2563eb 50%, transparent 70%)',
            bottom: '30%',
            right: '20%',
            filter: 'blur(20px)',
            animationDelay: '2s',
            animationDuration: '8s'
          }}
        />
        
        <div 
          className="absolute w-[150px] h-[150px] rounded-full opacity-45 animate-lava-bubble"
          style={{
            background: 'radial-gradient(circle, #60a5fa 0%, #3b82f6 40%, transparent 60%)',
            top: '70%',
            left: '10%',
            filter: 'blur(15px)',
            animationDelay: '4s',
            animationDuration: '6s'
          }}
        />
        
        {/* Flowing streams - darker */}
        <div 
          className="absolute w-[300px] h-[600px] opacity-20 animate-lava-stream"
          style={{
            background: 'linear-gradient(45deg, transparent 0%, #2563eb 20%, #3b82f6 40%, #60a5fa 60%, transparent 100%)',
            top: '0%',
            right: '10%',
            filter: 'blur(30px)',
            borderRadius: '50%',
            animationDelay: '6s',
            animationDuration: '15s'
          }}
        />
        
        {/* Surface ripples - darker */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-15 animate-lava-ripple"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              background: `radial-gradient(circle, #3b82f6 0%, transparent 70%)`,
              left: `${20 + (i * 10)}%`,
              top: `${30 + (i * 8)}%`,
              filter: 'blur(10px)',
              animationDelay: `${i * 2}s`,
              animationDuration: `${10 + i * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Darker overlay to maintain readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-900/50 to-slate-800/70" />
    </div>
  );
};

export default AnimatedLiquidBackground;