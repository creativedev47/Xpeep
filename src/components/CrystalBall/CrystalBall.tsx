import React from 'react';

export const CrystalBall = () => {
    return (
        <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />

            {/* The Orb */}
            <div className="absolute inset-4 bg-gradient-to-br from-background-light via-background to-background-light border border-primary/5 rounded-full backdrop-blur-xl overflow-hidden shadow-xl">
                {/* Swirling Mists */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent,rgb(var(--color-primary)/0.1),transparent)] animate-spin-slow" />
                </div>

                {/* Reflections */}
                <div className="absolute top-4 left-1/4 w-1/2 h-1/4 bg-background-light/40 rounded-full blur-md transform -rotate-12" />

                {/* Content inside the ball (e.g., a floating "X") */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl font-bold text-primary drop-shadow-sm animate-float">
                        X
                    </div>
                </div>
            </div>

            {/* Base/Stand */}
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-48 h-12 bg-background border-t border-primary/5 rounded-[100%] shadow-md" />
        </div>

    );
};
