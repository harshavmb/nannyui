
import React, { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface GlassMorphicCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassMorphicCard: React.FC<GlassMorphicCardProps> = ({ 
  children, 
  className, 
  hoverEffect = false 
}) => {
  return (
    <div 
      className={cn(
        "glass-card rounded-lg p-6",
        hoverEffect && "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassMorphicCard;
