import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import './App.css'; // Ensure this includes necessary CSS

function App() {
  const [scales, setScales] = useState(Array(10).fill(1)); // Initial scales for 10 cards
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: Array.from({ length: 101 }, (_, i) => i * 0.01), // Thresholds from 0% to 100%
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.getAttribute('data-index'));
        const visibility = entry.intersectionRatio; // Ratio of card visible in viewport

        // Apply exponential scaling by raising the visibility ratio to a power
        const exponent = 2; // You can adjust this exponent to control the effect
        const exponentialScale = Math.pow(visibility, exponent); // Exponentially proportional scaling

        setScales((prevScales) => {
          const newScales = [...prevScales];
          newScales[index] = exponentialScale; // Use exponential scaling
          return newScales;
        });
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe each card to update scale based on visibility
    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen w-screen"> {/* Center the container to viewport */}
      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center h-[600px] w-[800px] px-20 overflow-y-scroll scroll-snap-type-y-mandatory rounded-[48px] hide-scrollbar" // Added hide-scrollbar class
      >
        <div> {/* Added space-y-4 for vertical gaps */}
          <AnimatePresence>
            {[...Array(25).keys()].map((_, index) => (
              <Card key={index} index={index} scale={scales[index]} cardRefs={cardRefs} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Card({ index, scale, cardRefs }) {
  const ref = useRef(null);

  useEffect(() => {
    cardRefs.current[index] = ref.current;
  }, [index, cardRefs]);

  // Use motion value to manage scale directly
  const scaleValue = useMotionValue(scale);

  // Synchronize scale value with the latest scale from props
  useEffect(() => {
    scaleValue.set(scale);
  }, [scale, scaleValue]);

  return (
    <motion.div
      ref={ref}
      data-index={index}
      style={{
        height: '1000px',
        maxHeight: '300px',
        width: `${scale * 100}%`, // Adjust width based on visibility
        maxWidth: '800px',
        minWidth: '600px',
        scrollSnapAlign: 'start',
        marginTop: '12px',
      }}
      className="bg-slate-300 rounded-[48px]"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: scale, opacity: scale }} // Directly animate the scale and opacity
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.1, ease: 'easeOut' }} // Smooth, non-bouncy transition
    />
  );
}

export default App;
