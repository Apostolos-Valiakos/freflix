const DEFAULT_COLOR = "#17171b";
let requestId = 0;

function applyColor(color: string) {
  document.documentElement.style.setProperty("--ambient-color", color);
}

// Average the artwork's pixels, favouring saturated ones, then darken the
// result so text stays readable on top of it.
function sampleColor(image: HTMLImageElement) {
  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return DEFAULT_COLOR;
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const max = Math.max(data[i]!, data[i + 1]!, data[i + 2]!);
    const min = Math.min(data[i]!, data[i + 1]!, data[i + 2]!);
    const weight = 1 + (max - min) / 32;
    r += data[i]! * weight;
    g += data[i + 1]! * weight;
    b += data[i + 2]! * weight;
    total += weight;
  }
  if (!total) return DEFAULT_COLOR;

  const scale = 0.55 / total;
  return `rgb(${Math.round(r * scale)}, ${Math.round(g * scale)}, ${Math.round(
    b * scale
  )})`;
}

export function setAmbientFromImage(path?: string | null) {
  const id = ++requestId;
  if (!path) {
    applyColor(DEFAULT_COLOR);
    return;
  }
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    if (id !== requestId) return;
    try {
      applyColor(sampleColor(image));
    } catch {
      applyColor(DEFAULT_COLOR);
    }
  };
  image.src = img(path, "w92");
}

export function resetAmbient() {
  requestId++;
  applyColor(DEFAULT_COLOR);
}
