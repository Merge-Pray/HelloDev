import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./avatar.module.css";

/**
 * Avatar: Pixel-Editor mit Upload, JSON- & PNG-Export (via imperative API).
 *
 * Props:
 * - sizePx?: number        // Darstellungsgröße (Pixelbreite des Editors), default 512
 * - gridSize?: number      // Initiale Rastergröße (default 32)
 * - initialData?: string[] // optional: Hex-Farbwerte (#RRGGBB) flach (grid*grid)
 * - onDataChange?: fn      // Callback(pixels: string[])
 *
 * Imperative API (über ref):
 * - getPixels(): string[]
 * - setPixels(p: string[]): void
 * - toJSON(): { gridSize: number, pixels: string[] }
 * - toPNGDataURL(bg?: "transparent" | string): string
 * - randomize(): void
 * - refreshSuggestions(): void
 */
const Avatar = forwardRef(function Avatar(
  {
    sizePx = 64,
    gridSize: initialGridSize = 16,
    initialData,
    onDataChange,
  },
  ref
) {
  // UI-States
  const [currentColor, setCurrentColor] = useState("#5d3f94");
  const [tool, setTool] = useState("pen"); // "pen" | "eraser" | "picker"
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Grid/Pixel-States
  const [gridSize, setGridSize] = useState(initialGridSize);

  const blank = useMemo(
    () => Array.from({ length: gridSize * gridSize }, () => "#ffffff"),
    [gridSize]
  );

  const [pixels, setPixels] = useState(() => {
    if (initialData && initialData.length === initialGridSize * initialGridSize) {
      return initialData;
    }
    return Array.from({ length: initialGridSize * initialGridSize }, () => "#ffffff");
  });

  // Vorschläge (5 Arrays)
  const [suggestions, setSuggestions] = useState(() =>
    makeSuggestions(gridSize, 5)
  );

  // Resample bei Gridwechsel
  useEffect(() => {
    setPixels((prev) => {
      const prevSize = Math.sqrt(prev.length) | 0;
      if (prevSize === gridSize) return prev;
      return resamplePixels(prev, prevSize, gridSize);
    });
    setSuggestions(makeSuggestions(gridSize, 5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  // Callback für Datenänderungen
  useEffect(() => {
    if (onDataChange) onDataChange(pixels);
  }, [pixels, onDataChange]);

  // Refs
  const containerRef = useRef(null);

  // Utility: x,y <-> index
  const idx = useCallback((x, y) => y * gridSize + x, [gridSize]);

  // Malen
  const paintAt = useCallback(
    (x, y, col) => {
      if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return;
      setPixels((prev) => {
        const next = prev.slice();
        next[idx(x, y)] = col;
        return next;
      });
    },
    [gridSize, idx]
  );

  // Koordinaten aus Event
  const getXYFromEvent = useCallback(
    (clientX, clientY) => {
      const el = containerRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;
      const cell = rect.width / gridSize;
      const x = Math.floor(relX / cell);
      const y = Math.floor(relY / cell);
      if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return null;
      return { x, y };
    },
    [gridSize]
  );

  // Maus-Events
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getXYFromEvent(e.clientX, e.clientY);
    if (!pos) return;
    if (tool === "picker") {
      const picked = pixels[idx(pos.x, pos.y)];
      setCurrentColor(picked);
      setTool("pen");
      return;
    }
    paintAt(pos.x, pos.y, tool === "eraser" ? "#ffffff" : currentColor);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const pos = getXYFromEvent(e.clientX, e.clientY);
    if (!pos || tool === "picker") return;
    paintAt(pos.x, pos.y, tool === "eraser" ? "#ffffff" : currentColor);
  };

  const handleMouseUp = () => setIsDrawing(false);
  const handleMouseLeave = () => setIsDrawing(false);

  // Touch-Events
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    if (!t) return;
    handleMouseDown({ preventDefault: () => {}, clientX: t.clientX, clientY: t.clientY });
  };
  const handleTouchMove = (e) => {
    const t = e.touches[0];
    if (!t) return;
    handleMouseMove({ clientX: t.clientX, clientY: t.clientY });
  };
  const handleTouchEnd = () => handleMouseUp();

  // Cleanup
  useEffect(() => {
    const up = () => setIsDrawing(false);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  // Upload → auf aktuelle gridSize runterbrechen
  const handleFile = async (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => {});
    const cvs = document.createElement("canvas");
    cvs.width = gridSize;
    cvs.height = gridSize;
    const ctx = cvs.getContext("2d");
    const scale = Math.min(cvs.width / img.width, cvs.height / img.height);
    const w = Math.max(1, Math.floor(img.width * scale));
    const h = Math.max(1, Math.floor(img.height * scale));
    const ox = Math.floor((cvs.width - w) / 2);
    const oy = Math.floor((cvs.height - h) / 2);
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, ox, oy, w, h);

    const data = ctx.getImageData(0, 0, gridSize, gridSize).data;
    const next = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const base = (y * gridSize + x) * 4;
        const r = data[base + 0];
        const g = data[base + 1];
        const b = data[base + 2];
        const a = data[base + 3];
        const hex =
          a < 10 ? "#ffffff" : "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
        next.push(hex);
      }
    }
    setPixels(next);
    URL.revokeObjectURL(url);
  };

  // Imperative API
  useImperativeHandle(ref, () => ({
    getPixels: () => pixels.slice(),
    setPixels: (p) => {
      if (Array.isArray(p) && p.length === gridSize * gridSize) setPixels(p.slice());
    },
    toJSON: () => ({ gridSize, pixels }),
    toPNGDataURL: (bg = "#ffffff") => {
      const out = document.createElement("canvas");
      out.width = sizePx;
      out.height = sizePx;
      const ctx = out.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      const cell = sizePx / gridSize;
      if (bg === "transparent") {
        ctx.clearRect(0, 0, out.width, out.height);
      } else {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, out.width, out.height);
      }
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          ctx.fillStyle = pixels[idx(x, y)];
          ctx.fillRect(Math.floor(x * cell), Math.floor(y * cell), Math.ceil(cell), Math.ceil(cell));
        }
      }
      return out.toDataURL("image/png");
    },
    randomize: () => setPixels(randomizePixels(gridSize)),
    refreshSuggestions: () => setSuggestions(makeSuggestions(gridSize, 5)),
  }), [pixels, gridSize, sizePx, idx]);

  // JSON-Import (Buttons für Export wurden entfernt; Parent speichert über ref)
  const importJSON = async (file) => {
    const text = await file.text().catch(() => null);
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      if (
        typeof parsed === "object" &&
        typeof parsed.gridSize === "number" &&
        Array.isArray(parsed.pixels) &&
        parsed.pixels.length === parsed.gridSize * parsed.gridSize
      ) {
        setGridSize(parsed.gridSize);
        setPixels(parsed.pixels);
      } else {
        alert("Ungültiges JSON-Format.");
      }
    } catch {
      alert("JSON konnte nicht geparst werden.");
    }
  };

  // Cell Size
  const cellSize = useMemo(() => Math.floor(sizePx / gridSize), [sizePx, gridSize]);

  // Sichtbares Grid – defensiver Default (unabhängig von CSS-Var)
  const gridLine = "rgba(15,23,42,0.08)"; // fallback
  const gridBackground = showGrid
    ? {
        backgroundImage:
          `linear-gradient(to right, ${gridLine} 1px, transparent 1px),
           linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)`,
        backgroundSize: `${cellSize}px ${cellSize}px`,
      }
    : { backgroundImage: "none" };

// Mini-Renderer für Vorschlag-Previews
const renderSuggestion = (arr) => {
  const g = Math.sqrt(arr.length) | 0;

  // Vorschaugröße = gridSize * 4, aber gedeckelt auf 128px
  const s = Math.min(g * 4, 128);

  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const cell = s / g;
  ctx.clearRect(0, 0, s, s);

  for (let y = 0; y < g; y++) {
    for (let x = 0; x < g; x++) {
      ctx.fillStyle = arr[y * g + x];
      ctx.fillRect(
        Math.floor(x * cell),
        Math.floor(y * cell),
        Math.ceil(cell),
        Math.ceil(cell)
      );
    }
  }
  return c.toDataURL("image/png");
};

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        {/* Linke Seite: Farbe + Tools */}
        <div className={styles.leftGroup}>
          <label className={styles.colorLabel}>
            <span>Farbe</span>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              aria-label="Color Picker"
            />
          </label>

          <div className={styles.tools}>
            <button
              className={`${styles.toolBtn} ${tool === "pen" ? styles.active : ""}`}
              onClick={() => setTool("pen")}
              title="Stift (malen)"
            >
              ✏️ Stift
            </button>
            <button
              className={`${styles.toolBtn} ${tool === "eraser" ? styles.active : ""}`}
              onClick={() => setTool("eraser")}
              title="Radierer (weiß)"
            >
              🩹 Radierer
            </button>
            <button
              className={`${styles.toolBtn} ${tool === "picker" ? styles.active : ""}`}
              onClick={() => setTool("picker")}
              title="Pipette"
            >
              🎯 Pipette
            </button>
          </div>
        </div>

        {/* Rechte Seite: Grid + Auflösung + Dateiaktionen */}
        <div className={styles.rightGroup}>
          <label className={styles.inlineControl}>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            <span>Grid anzeigen</span>
          </label>

          <label className={styles.inlineControl}>
            <span>Auflösung</span>
            <select
              className={styles.select}
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value, 10))}
            >
              {[16, 32, 64].map((n) => (
                <option key={n} value={n}>
                  {n} × {n}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.actions}>
            <label className={styles.fileLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              Bild laden
            </label>

            <label className={styles.fileLabel}>
              <input
                type="file"
                accept="application/json"
                onChange={(e) => importJSON(e.target.files?.[0])}
              />
              JSON laden
            </label>

            {/* Export-Buttons entfernt – Parent nutzt imperative API */}
          </div>
        </div>
      </div>

      <div
        className={styles.grid}
        ref={containerRef}
        style={{
          width: sizePx + "px",
          height: sizePx + "px",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          ...gridBackground,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pixels.map((col, i) => (
          <div
            key={i}
            className={styles.cell}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: col,
            }}
          />
        ))}
      </div>

      {/* Zufall & Vorschläge */}
      <div className={styles.suggestionsBar}>
        <button
          className={styles.primaryBtn}
          onClick={() => setPixels(randomizePixels(gridSize))}
          title="Zufälligen Avatar generieren"
        >
          🎲 Zufall
        </button>
        <button
          className={styles.secondaryBtn}
          onClick={() => setSuggestions(makeSuggestions(gridSize, 5))}
          title="Neue Vorschläge würfeln"
        >
          🔄 Vorschläge neu
        </button>
      </div>

      <div className={styles.suggestions}>
        {suggestions.map((arr, i) => (
          <button
            key={i}
            className={styles.suggestionItem}
            onClick={() => setPixels(arr)}
            title="Vorschlag übernehmen"
          >
            {/* kleine Preview als <img> aus DataURL */}
            <img alt={`Vorschlag ${i + 1}`} src={renderSuggestion(arr)} />
          </button>
        ))}
      </div>
    </div>
  );
});

export default Avatar;

/** ---------- Utilities ---------- **/

/** Nearest-Neighbor Resampling von einem quadratischen Array */
function resamplePixels(prev, fromSize, toSize) {
  if (fromSize === toSize) return prev.slice();
  const next = new Array(toSize * toSize);
  for (let y = 0; y < toSize; y++) {
    const srcY = Math.min(fromSize - 1, Math.max(0, Math.floor(((y + 0.5) * fromSize) / toSize)));
    for (let x = 0; x < toSize; x++) {
      const srcX = Math.min(fromSize - 1, Math.max(0, Math.floor(((x + 0.5) * fromSize) / toSize)));
      next[y * toSize + x] = prev[srcY * fromSize + srcX];
    }
  }
  return next;
}

/** Einfache Zufallsgenerierung – symmetrisch + kleine Rauschfelder */
function randomizePixels(g) {
  const palette = [
    "#000000", "#ffffff",
    "#5d3f94", "#a78bfa", "#9333ea",
    "#ef4444", "#f59e0b", "#10b981", "#3b82f6"
  ];
  const pick = () => palette[(Math.random() * palette.length) | 0];

  const arr = Array.from({ length: g * g }, () => "#ffffff");

  // Symmetrisches Gesicht / Pattern (linke Hälfte füllen, rechte spiegeln)
  const half = Math.ceil(g / 2);
  for (let y = 0; y < g; y++) {
    for (let x = 0; x < half; x++) {
      const useColor =
        Math.random() < 0.15 ? pick() :
        Math.random() < 0.6 ? "#ffffff" : pick();
      arr[y * g + x] = useColor;
      arr[y * g + (g - 1 - x)] = useColor;
    }
  }

  // Rauschflecken / Akzente
  const blobs = 2 + (Math.random() * 4) | 0;
  for (let b = 0; b < blobs; b++) {
    const cx = (Math.random() * g) | 0;
    const cy = (Math.random() * g) | 0;
    const r = 1 + (Math.random() * (g / 8)) | 0;
    const color = pick();
    for (let y = Math.max(0, cy - r); y < Math.min(g, cy + r); y++) {
      for (let x = Math.max(0, cx - r); x < Math.min(g, cx + r); x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r && Math.random() < 0.8) {
          arr[y * g + x] = color;
        }
      }
    }
  }

  // Augen-Punkte (bei kleineren Grids)
  if (g >= 16) {
    const ey = (g / 3) | 0;
    const ex = (g / 4) | 0;
    const eyeC = "#000000";
    arr[ey * g + (g / 2 - ex) | 0] = eyeC;
    arr[ey * g + (g / 2 + ex) | 0] = eyeC;
  }

  return arr;
}

/** N Vorschläge erzeugen */
function makeSuggestions(g, n) {
  return Array.from({ length: n }, () => randomizePixels(g));
}