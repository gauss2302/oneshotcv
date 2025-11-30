import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDF = async () => {
  // Find all page elements
  const pages = document.querySelectorAll(".cv-page");
  if (pages.length === 0) return;

  try {
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const pdfWidth = 210;
    const pdfHeight = 297;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;

      // Create a clone of the page to capture without UI transforms (zoom)
      const clone = page.cloneNode(true) as HTMLElement;

      // Reset styles on the clone to ensure clean capture
      clone.style.transform = "none";
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-9999";
      clone.style.margin = "0";
      clone.style.boxShadow = "none"; // Remove shadow for PDF

      // Append to body so it's rendered
      document.body.appendChild(clone);

      // Capture the clone
      const canvas = await html2canvas(clone, {
        scale: 1.5, // Balanced quality and file size
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        logging: false,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        removeContainer: true, // Clean up after rendering
        onclone: (clonedDoc) => {
          // Helper to parse modern color functions to RGB
          const parseColorToRgb = (colorStr: string, propName: string = "color"): string => {
            // Handle modern color functions that html2canvas doesn't support
            if (colorStr.includes("oklab(") || colorStr.includes("oklch(") ||
                colorStr.includes("lab(") || colorStr.includes("lch(") ||
                colorStr.includes("color-mix(")) {

              // Create a temporary element to let the browser compute the color
              const temp = document.createElement("div");
              temp.style.color = colorStr;
              temp.style.position = "absolute";
              temp.style.visibility = "hidden";
              document.body.appendChild(temp);

              const computed = window.getComputedStyle(temp).color;
              document.body.removeChild(temp);

              // If browser still returns modern format, use a fallback
              if (computed.includes("oklab") || computed.includes("lab") ||
                  computed.includes("lch") || computed.includes("color-mix")) {
                // Extract RGB if it's rgb() or rgba()
                const rgbMatch = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
                if (rgbMatch) {
                  return `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
                }
                // Default fallback - white for backgrounds, black for text
                return propName.toLowerCase().includes("background") ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)";
              }

              return computed;
            }

            return colorStr;
          };

          // Process all elements
          const elements = clonedDoc.querySelectorAll("*");
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);

            // Color properties that need conversion
            const colorProps: Array<keyof CSSStyleDeclaration> = [
              "color",
              "backgroundColor",
              "borderColor",
              "borderTopColor",
              "borderRightColor",
              "borderBottomColor",
              "borderLeftColor",
              "outlineColor",
              "fill",
              "stroke",
            ];

            colorProps.forEach((prop) => {
              const value = computedStyle[prop] as string;
              if (value && typeof value === "string") {
                const converted = parseColorToRgb(value, String(prop));
                if (converted !== value) {
                  htmlEl.style[prop as any] = converted;
                }
              }
            });

            // Handle complex properties like boxShadow and background
            const boxShadow = computedStyle.boxShadow;
            if (boxShadow && boxShadow !== "none") {
              const converted = boxShadow.replace(
                /(?:oklab|oklch|lab|lch|color-mix)\([^)]+\)/g,
                (match) => parseColorToRgb(match)
              );
              if (converted !== boxShadow) {
                htmlEl.style.boxShadow = converted;
              }
            }
          });
        },
      });

      // Remove the clone
      document.body.removeChild(clone);

      // Use JPEG with 0.85 quality for optimal compression
      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      // Add page to PDF (except for the first one which is already created)
      if (i > 0) {
        pdf.addPage();
      }

      // Add image to the current page with compression
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    }

    pdf.save("my-cv.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
