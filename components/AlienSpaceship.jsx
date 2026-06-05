"use client";
import { useEffect, useState, useRef } from "react";

export default function AlienSpaceship() {
  const [offset, setOffset] = useState(0);
  const [direction, setDirection] = useState({ dx: 0, dy: 0 });
  const spaceshipRef = useRef(null);

  const getRandomDirection = () => {
    // Directions: 0: none, 1: up, 2: down, 3: left, 4: right, 5: up-left, 6: up-right, 7: down-left, 8: down-right
    const rand = Math.floor(Math.random() * 9);
    let dx = 0;
    let dy = 0;

    switch (rand) {
      case 1: dy = -1; break; // Up
      case 2: dy = 1; break;  // Down
      case 3: dx = -1; break; // Left
      case 4: dx = 1; break;  // Right
      case 5: dx = -1; dy = -1; break; // Up-Left
      case 6: dx = 1; dy = -1; break;  // Up-Right
      case 7: dx = -1; dy = 1; break;  // Down-Left
      case 8: dx = 1; dy = 1; break;   // Down-Right
      // Case 0: dx = 0, dy = 0 (no movement)
    }
    return { dx, dy };
  };

  useEffect(() => {
    // Set a random direction when the component mounts
    setDirection(getRandomDirection());

    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define movement speed multiplier
  const movementSpeed = 0.1; // Adjust this value to control how much the spaceship moves with scroll

  // Calculate the spaceship's position
  const transformStyle = {
    transform: `translate(${direction.dx * offset * movementSpeed}px, ${direction.dy * offset * movementSpeed}px)`,
    // You can add more complex transforms here if needed, e.g., rotation based on direction
  };

  // Ensure the spaceship is positioned at the top-left initially and then moves
  const initialPositionStyle = {
    top: '0px', // Or adjust based on desired starting vertical position
    left: '0px', // Or adjust based on desired starting horizontal position
  };

  return (
    <div
      ref={spaceshipRef}
      className="fixed pointer-events-none z-50 w-20 h-20" // z-50 to ensure it's above most content
      style={{
        ...initialPositionStyle,
        ...transformStyle,
        // You might want to add a transition for smoother movement, but it can fight with scroll-driven updates
        // transition: 'transform 0.1s ease-out',
      }}
    >
      <img
        src="https://st2.depositphotos.com/44860292/43697/v/450/depositphotos_436975306-stock-illustration-illustration-vector-graphic-alien-cartoon.jpg"
        alt="Alien Spaceship"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
