import { useEffect, useRef, useState } from "react";

/**
 * Renders a template at its native size and scales it down to fit the wrapper.
 * baseWidth/baseHeight should match the size your templates were designed for.
 */
export default function ScaledTemplate({
  Template,
  data,
  baseWidth = 700,   // ← your template's natural width
  baseHeight = 440,  // ← your template's natural height
  className = "",
}) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const resize = () => {
      const w = el.clientWidth || 1;
      setScale(w / baseWidth);
    };

    // Initial + responsive scaling
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseWidth]);

  return (
    <div ref={wrapRef} className={className}>
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <Template {...data} side="front" />
      </div>
    </div>
  );
}
