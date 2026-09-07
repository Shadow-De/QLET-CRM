"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
}

export function CountUp({ end, duration = 2 }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / (duration * 1000), 1);
      
      // Easing out
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);
      
      setCount(Math.floor(easeOut * end));

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <>{count}</>;
}
