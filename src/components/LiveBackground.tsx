'use client';

export default function LiveBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden',
      background: 'var(--bg-primary)',
      perspective: '1000px'
    }}>
      {/* Floating 3D Glass Shapes */}
      <div className="shape sphere sphere-1" />
      <div className="shape cube cube-1" />
      <div className="shape cube cube-2" />
      <div className="shape sphere sphere-2" />
      <div className="shape pyramid pyramid-1" />
      
      <style jsx>{`
        .shape {
          position: absolute;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 
            inset 2px 2px 5px rgba(255,255,255,0.9), 
            inset -3px -3px 7px rgba(0,0,0,0.03), 
            8px 8px 16px rgba(162, 175, 194, 0.3);
        }
        
        .sphere {
          border-radius: 50%;
          animation: float-sphere 18s infinite alternate ease-in-out;
        }
        
        .cube {
          border-radius: 20px;
          animation: float-rotate 25s infinite linear;
        }
        
        .pyramid {
          border-radius: 12px;
          animation: float-rotate-reverse 20s infinite linear;
        }

        .sphere-1 {
          width: 300px; height: 300px;
          top: 5%; left: 10%;
          animation-duration: 22s;
        }
        
        .sphere-2 {
          width: 200px; height: 200px;
          bottom: 15%; right: 15%;
          animation-duration: 26s;
          animation-delay: -7s;
        }
        
        .cube-1 {
          width: 220px; height: 220px;
          top: 45%; right: 8%;
        }
        
        .cube-2 {
          width: 140px; height: 140px;
          bottom: 10%; left: 25%;
          animation-duration: 30s;
        }
        
        .pyramid-1 {
          width: 120px; height: 120px;
          top: 20%; right: 40%;
        }
        
        @keyframes float-sphere {
          0% { transform: translateZ(0) translateY(0); }
          100% { transform: translateZ(120px) translateY(-60px); }
        }
        
        @keyframes float-rotate {
          0% { transform: translateZ(0) translateY(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          50% { transform: translateZ(200px) translateY(-40px) rotateX(180deg) rotateY(90deg) rotateZ(45deg); }
          100% { transform: translateZ(0) translateY(0) rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
        }
        
        @keyframes float-rotate-reverse {
          0% { transform: translateZ(0) translateY(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          50% { transform: translateZ(-150px) translateY(50px) rotateX(-180deg) rotateY(-90deg) rotateZ(-45deg); }
          100% { transform: translateZ(0) translateY(0) rotateX(-360deg) rotateY(-180deg) rotateZ(-90deg); }
        }
      `}</style>
    </div>
  );
}
