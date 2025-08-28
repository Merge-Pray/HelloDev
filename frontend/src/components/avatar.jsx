import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./avatar.module.css";

/**
 * Avatar: 32x32 Pixel-Editor mit Upload, JSON- & PNG-Export.
 *
 * Props:
 * - sizePx?: number      // Darstellungsgröße (Pixelbreite des Editors), default 512
 * - gridSize?: number    // Rastergröße (Standard 32)
 * - initialData?: string[] // optional: Hex-Farbwerte (#RRGGBB) flach (gridSize*gridSize)
 * - onDataChange?: function // Callback wenn sich die Pixel-Daten ändern
 */
export default function Avatar({
  sizePx = 512,
  gridSize = 32,
  initialData,
  onDataChange,
}) {
  // Farben als #RRGGBB (ohne Alpha)
  const [currentColor, setCurrentColor] = useState("#5d3f94"); // blau
  const [tool, setTool] = useState("pen"); // "pen" | "eraser" | "picker"
  const [isDrawing, setIsDrawing] = useState(false);

  // Pixel-Daten: flaches Array der Länge gridSize*gridSize
  const blank = useMemo(
    () => Array.from({ length: gridSize * gridSize }, () => "#ffffff"),
    [gridSize]
  );
  const [pixels, setPixels] = useState(() => {
    if (initialData && initialData.length === gridSize * gridSize) return initialData;
    return blank;
  });

  // Callback für Datenänderungen
  useEffect(() => {
    if (onDataChange) {
      onDataChange(pixels);
    }
  }, [pixels, onDataChange]);

  // Für Maus-/Touch-Events koordiniert:
  const containerRef = useRef(null);

  // Utility: x,y (0..gridSize-1) <-> index
  const idx = useCallback((x, y) => y * gridSize + x, [gridSize]);

  // Malen eines einzelnen Felds
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

  // Ermitteln von (x,y) aus Event-Position
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

  // Event-Handler (Maus)
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
    if (!pos) return;
    if (tool === "picker") return; // im Drag nichts tun
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

  useEffect(() => {
    const up = () => setIsDrawing(false);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  // Bild hochladen und auf 32x32 runterbrechen
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
    // Bild mittig maximal einpassen (cover/contain → hier contain, damit nichts abgeschnitten wird)
    const scale = Math.min(cvs.width / img.width, cvs.height / img.height);
    const w = Math.max(1, Math.floor(img.width * scale));
    const h = Math.max(1, Math.floor(img.height * scale));
    const ox = Math.floor((cvs.width - w) / 2);
    const oy = Math.floor((cvs.height - h) / 2);
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.imageSmoothingEnabled = true; // fürs Downscaling ok
    ctx.drawImage(img, ox, oy, w, h);

    const data = ctx.getImageData(0, 0, gridSize, gridSize).data;
    const next = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const base = (y * gridSize + x) * 4;
        const r = data[base + 0];
        const g = data[base + 1];
        const b = data[base + 2];
        // Alpha-Treshold (transparente Bereiche als weiß)
        const a = data[base + 3];
        const hex =
          a < 10 ? "#ffffff" : "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
        next.push(hex);
      }
    }
    setPixels(next);
    URL.revokeObjectURL(url);
  };

  // JSON-Export: { gridSize, pixels: string[] }
  const exportJSON = () => {
    const payload = JSON.stringify({ gridSize, pixels }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "avatar-32x32.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // JSON-Import
  const importJSON = async (file) => {
    const text = await file.text().catch(() => null);
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      if (
        typeof parsed === "object" &&
        parsed.gridSize === gridSize &&
        Array.isArray(parsed.pixels) &&
        parsed.pixels.length === gridSize * gridSize
      ) {
        setPixels(parsed.pixels);
      } else {
        alert("Ungültiges JSON-Format oder falsche gridSize.");
      }
    } catch {
      alert("JSON konnte nicht geparst werden.");
    }
  };

  // PNG-Export: skaliert (nearest neighbor) auf sizePx
  const exportPNG = () => {
    const out = document.createElement("canvas");
    out.width = sizePx;
    out.height = sizePx;
    const ctx = out.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const cell = sizePx / gridSize;

    // optional: transparenter Hintergrund? → hier weiß
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        ctx.fillStyle = pixels[idx(x, y)];
        ctx.fillRect(Math.floor(x * cell), Math.floor(y * cell), Math.ceil(cell), Math.ceil(cell));
      }
    }

    const url = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "avatar-32x32.png";
    a.click();
  };

  // Hilfs-Renderer für Grid-Zellen
  const cellSize = useMemo(() => Math.floor(sizePx / gridSize), [sizePx, gridSize]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
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

          <button onClick={exportJSON} className={styles.primaryBtn}>JSON export</button>
          <button onClick={exportPNG} className={styles.primaryBtn}>PNG export</button>
          <button onClick={() => setPixels(blank)} className={styles.resetBtn}>Leeren</button>
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
          // für perfekte Schärfe bei ungeraden Kanten:
          backgroundSize: `${cellSize}px ${cellSize}px`,
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
    </div>
  );
}