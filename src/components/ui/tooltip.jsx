import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const TooltipContext = createContext();

export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children, side = "top" }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  // Update coordinates when tooltip becomes visible
  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const offset = 8;
      let top = 0;
      let left = 0;

      switch (side) {
        case "top":
          top = rect.top - offset;
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - offset;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + offset;
          break;
        default:
          top = rect.top - offset;
          left = rect.left + rect.width / 2;
      }

      setCoords({ top, left });
    }
  }, [visible, side]);

  return (
    <TooltipContext.Provider value={{ visible, setVisible, triggerRef, coords, side }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({ children }) {
  const { setVisible, triggerRef } = useContext(TooltipContext);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="inline-block"
    >
      {children}
    </div>
  );
}

export function TooltipContent({ children }) {
  const { visible, coords, side } = useContext(TooltipContext);

  if (!visible) return null;

  // Calculate transform based on side
  let transform = "";
  switch (side) {
    case "top":
      transform = "translate(-50%, -100%)";
      break;
    case "bottom":
      transform = "translate(-50%, 0)";
      break;
    case "left":
      transform = "translate(-100%, -50%)";
      break;
    case "right":
      transform = "translate(0, -50%)";
      break;
    default:
      transform = "translate(-50%, -100%)";
  }

  return (
    <div
      className="absolute z-50 px-2 py-1 bg-black text-white rounded text-xs whitespace-nowrap"
      style={{
        top: coords.top,
        left: coords.left,
        transform,
      }}
    >
      {children}
    </div>
  );
}
