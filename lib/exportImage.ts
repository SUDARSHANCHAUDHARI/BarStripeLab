// Browser-only: rasterise a composed barcode SVG straight to PNG.
export async function svgToPngBlob(svg: string, width = 2400): Promise<Blob> {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1].trim().split(/\s+/).map(Number);
  const aspect = viewBox && viewBox[2] ? viewBox[3] / viewBox[2] : 1;
  const height = Math.round(width * aspect);

  // A viewBox-only SVG has no intrinsic size: Firefox will not draw it to a
  // canvas and Safari rasterises it small, then upscales (blurry bars). A mm
  // size is just as small at 96 dpi, so it is swapped for the pixel size.
  const sized = svg.replace(/^<svg\b[^>]*>/, (tag) =>
    tag.replace(/\s(?:width|height)="[^"]*"/g, "").replace(/^<svg/, `<svg width="${width}" height="${height}"`)
  );
  const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context unavailable");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG encoding failed"))), "image/png")
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
