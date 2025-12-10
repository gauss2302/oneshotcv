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

    // Helper to convert any color format to RGB (for preprocessing)
    const convertColorToRgbPreprocess = (
      colorStr: string,
      propName: string = "color"
    ): string => {
      if (!colorStr || colorStr === "none" || colorStr === "transparent") {
        return colorStr;
      }

      const hasUnsupportedColor =
        colorStr.includes("oklab(") ||
        colorStr.includes("oklch(") ||
        colorStr.includes("lab(") ||
        colorStr.includes("lch(") ||
        colorStr.includes("color-mix(");

      if (hasUnsupportedColor) {
        const temp = document.createElement("div");
        temp.style.position = "absolute";
        temp.style.visibility = "hidden";
        temp.style.opacity = "0";
        temp.style.pointerEvents = "none";

        if (propName.toLowerCase().includes("background")) {
          temp.style.backgroundColor = colorStr;
        } else if (propName.toLowerCase().includes("border")) {
          temp.style.borderColor = colorStr;
        } else {
          temp.style.color = colorStr;
        }

        document.body.appendChild(temp);

        try {
          const computed = window.getComputedStyle(temp);
          let computedColor = "";

          if (propName.toLowerCase().includes("background")) {
            computedColor = computed.backgroundColor;
          } else if (propName.toLowerCase().includes("border")) {
            computedColor = computed.borderColor;
          } else {
            computedColor = computed.color;
          }

          document.body.removeChild(temp);

          if (
            computedColor &&
            (computedColor.includes("oklab") ||
              computedColor.includes("lab") ||
              computedColor.includes("lch") ||
              computedColor.includes("color-mix"))
          ) {
            const rgbMatch = computedColor.match(
              /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
            );
            if (rgbMatch) {
              return `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
            }
            if (propName.toLowerCase().includes("background")) {
              return "rgb(255, 255, 255)";
            }
            return "rgb(0, 0, 0)";
          }

          if (
            computedColor &&
            (computedColor.startsWith("rgb") ||
              computedColor.startsWith("#") ||
              computedColor.match(/^[a-z]+$/))
          ) {
            return computedColor;
          }
        } catch {
          document.body.removeChild(temp);
          if (propName.toLowerCase().includes("background")) {
            return "rgb(255, 255, 255)";
          }
          return "rgb(0, 0, 0)";
        }
      }

      return colorStr;
    };

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;

      // Create a clone of the page to capture without UI transforms (zoom)
      const clone = page.cloneNode(true) as HTMLElement;

      // Pre-process clone: Convert any lab() colors in SVG elements
      const svgElements = clone.querySelectorAll(
        "svg, path, circle, rect, line, polyline, polygon, ellipse, text, g"
      );
      svgElements.forEach((svgEl) => {
        const fillAttr = svgEl.getAttribute("fill");
        if (
          fillAttr &&
          fillAttr !== "none" &&
          fillAttr !== "transparent" &&
          fillAttr !== "currentColor"
        ) {
          const converted = convertColorToRgbPreprocess(fillAttr, "fill");
          if (converted !== fillAttr) {
            svgEl.setAttribute("fill", converted);
          }
        }

        const strokeAttr = svgEl.getAttribute("stroke");
        if (
          strokeAttr &&
          strokeAttr !== "none" &&
          strokeAttr !== "transparent" &&
          strokeAttr !== "currentColor"
        ) {
          const converted = convertColorToRgbPreprocess(strokeAttr, "stroke");
          if (converted !== strokeAttr) {
            svgEl.setAttribute("stroke", converted);
          }
        }
      });

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
        onclone: (clonedDoc, clonedWindow) => {
          // Helper to convert any color format to RGB
          const convertColorToRgb = (
            colorStr: string,
            propName: string = "color"
          ): string => {
            if (
              !colorStr ||
              colorStr === "none" ||
              colorStr === "transparent"
            ) {
              return colorStr;
            }

            // Check if it contains unsupported color functions
            const hasUnsupportedColor =
              colorStr.includes("oklab(") ||
              colorStr.includes("oklch(") ||
              colorStr.includes("lab(") ||
              colorStr.includes("lch(") ||
              colorStr.includes("color-mix(");

            if (hasUnsupportedColor) {
              // Get the window/view object with proper typing
              let view: Window | null = null;
              if (clonedWindow) {
                const windowCandidate = clonedWindow as unknown;
                if (
                  windowCandidate &&
                  typeof (windowCandidate as Window).getComputedStyle ===
                    "function"
                ) {
                  view = windowCandidate as Window;
                }
              }
              if (!view && clonedDoc.defaultView) {
                const defaultView = clonedDoc.defaultView as unknown;
                if (
                  defaultView &&
                  typeof (defaultView as Window).getComputedStyle === "function"
                ) {
                  view = defaultView as Window;
                }
              }
              if (
                !view &&
                window &&
                typeof window.getComputedStyle === "function"
              ) {
                view = window;
              }

              if (!view) {
                // Fallback if getComputedStyle is not available
                if (propName.toLowerCase().includes("background")) {
                  return "rgb(255, 255, 255)";
                }
                return "rgb(0, 0, 0)";
              }

              // Use the cloned window's getComputedStyle for better compatibility
              const temp = clonedDoc.createElement("div");
              temp.style.position = "absolute";
              temp.style.visibility = "hidden";
              temp.style.opacity = "0";
              temp.style.pointerEvents = "none";

              // Set the color property based on the property name
              if (propName.toLowerCase().includes("background")) {
                temp.style.backgroundColor = colorStr;
              } else if (propName.toLowerCase().includes("border")) {
                temp.style.borderColor = colorStr;
              } else if (propName.toLowerCase().includes("fill")) {
                temp.style.color = colorStr; // Use color as proxy for fill
              } else if (propName.toLowerCase().includes("stroke")) {
                temp.style.color = colorStr; // Use color as proxy for stroke
              } else {
                temp.style.color = colorStr;
              }

              clonedDoc.body.appendChild(temp);

              try {
                // Call getComputedStyle with proper context to avoid illegal invocation
                const computed = view.getComputedStyle(temp);
                let computedColor = "";

                if (propName.toLowerCase().includes("background")) {
                  computedColor = computed.backgroundColor;
                } else if (propName.toLowerCase().includes("border")) {
                  computedColor = computed.borderColor;
                } else {
                  computedColor = computed.color;
                }

                clonedDoc.body.removeChild(temp);

                // If browser still returns modern format, extract RGB or use fallback
                if (
                  computedColor &&
                  (computedColor.includes("oklab") ||
                    computedColor.includes("lab") ||
                    computedColor.includes("lch") ||
                    computedColor.includes("color-mix"))
                ) {
                  // Try to extract RGB values
                  const rgbMatch = computedColor.match(
                    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
                  );
                  if (rgbMatch) {
                    return `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
                  }
                  // Fallback based on property type
                  if (propName.toLowerCase().includes("background")) {
                    return "rgb(255, 255, 255)";
                  }
                  return "rgb(0, 0, 0)";
                }

                // Return the computed color if it's in a supported format
                if (
                  computedColor &&
                  (computedColor.startsWith("rgb") ||
                    computedColor.startsWith("#") ||
                    computedColor.match(/^[a-z]+$/))
                ) {
                  return computedColor;
                }
              } catch {
                clonedDoc.body.removeChild(temp);
                // Fallback on error
                if (propName.toLowerCase().includes("background")) {
                  return "rgb(255, 255, 255)";
                }
                return "rgb(0, 0, 0)";
              }
            }

            return colorStr;
          };

          // Process all elements including SVG
          const elements = clonedDoc.querySelectorAll("*");
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;

            // Get the window/view object with proper typing
            let view: Window | null = null;
            if (clonedWindow) {
              const windowCandidate = clonedWindow as unknown;
              if (
                windowCandidate &&
                typeof (windowCandidate as Window).getComputedStyle ===
                  "function"
              ) {
                view = windowCandidate as Window;
              }
            }
            if (!view && clonedDoc.defaultView) {
              const defaultView = clonedDoc.defaultView as unknown;
              if (
                defaultView &&
                typeof (defaultView as Window).getComputedStyle === "function"
              ) {
                view = defaultView as Window;
              }
            }
            if (
              !view &&
              window &&
              typeof window.getComputedStyle === "function"
            ) {
              view = window;
            }

            if (!view) {
              // Skip if getComputedStyle is not available
              return;
            }

            // Call getComputedStyle with proper context to avoid illegal invocation
            const computedStyle = view.getComputedStyle(htmlEl);

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
            ];

            // Convert CSS color properties
            colorProps.forEach((prop) => {
              const value = computedStyle[prop] as string;
              if (
                value &&
                typeof value === "string" &&
                value !== "none" &&
                value !== "transparent"
              ) {
                const converted = convertColorToRgb(value, String(prop));
                if (converted && converted !== value) {
                  (htmlEl.style as unknown as Record<string, string>)[
                    prop as string
                  ] = converted;
                }
              }
            });

            // Process inline styles that might contain modern color functions
            const inlineStyle = htmlEl.getAttribute("style");
            if (inlineStyle) {
              // Check for modern color functions in inline styles
              const hasModernColors = /(oklab|oklch|lab|lch|color-mix)\(/i.test(
                inlineStyle
              );
              if (hasModernColors) {
                // Replace modern color functions in inline styles
                const convertedStyle = inlineStyle.replace(
                  /(oklab|oklch|lab|lch|color-mix)\([^)]+\)/gi,
                  (match) => {
                    const converted = convertColorToRgb(match);
                    return converted !== match ? converted : "rgb(0, 0, 0)";
                  }
                );
                if (convertedStyle !== inlineStyle) {
                  htmlEl.setAttribute("style", convertedStyle);
                }
              }
            }

            // Handle SVG elements specifically (svg, path, circle, rect, line, etc.)
            const tagName = htmlEl.tagName?.toLowerCase();
            const isSvgElement =
              tagName === "svg" ||
              tagName === "path" ||
              tagName === "circle" ||
              tagName === "rect" ||
              tagName === "line" ||
              tagName === "polyline" ||
              tagName === "polygon" ||
              tagName === "ellipse" ||
              tagName === "text" ||
              tagName === "g" ||
              htmlEl.namespaceURI === "http://www.w3.org/2000/svg";

            if (isSvgElement) {
              // Convert fill attribute
              const fillAttr = htmlEl.getAttribute("fill");
              if (
                fillAttr &&
                fillAttr !== "none" &&
                fillAttr !== "transparent" &&
                fillAttr !== "currentColor"
              ) {
                const convertedFill = convertColorToRgb(fillAttr, "fill");
                if (convertedFill && convertedFill !== fillAttr) {
                  htmlEl.setAttribute("fill", convertedFill);
                }
              }

              // Convert stroke attribute
              const strokeAttr = htmlEl.getAttribute("stroke");
              if (
                strokeAttr &&
                strokeAttr !== "none" &&
                strokeAttr !== "transparent" &&
                strokeAttr !== "currentColor"
              ) {
                const convertedStroke = convertColorToRgb(strokeAttr, "stroke");
                if (convertedStroke && convertedStroke !== strokeAttr) {
                  htmlEl.setAttribute("stroke", convertedStroke);
                }
              }

              // Convert fill style property
              const fillStyle = computedStyle.fill;
              if (
                fillStyle &&
                fillStyle !== "none" &&
                fillStyle !== "transparent" &&
                fillStyle !== "currentColor"
              ) {
                const convertedFill = convertColorToRgb(fillStyle, "fill");
                if (convertedFill && convertedFill !== fillStyle) {
                  htmlEl.style.fill = convertedFill;
                }
              }

              // Convert stroke style property
              const strokeStyle = computedStyle.stroke;
              if (
                strokeStyle &&
                strokeStyle !== "none" &&
                strokeStyle !== "transparent" &&
                strokeStyle !== "currentColor"
              ) {
                const convertedStroke = convertColorToRgb(
                  strokeStyle,
                  "stroke"
                );
                if (convertedStroke && convertedStroke !== strokeStyle) {
                  htmlEl.style.stroke = convertedStroke;
                }
              }
            }

            // Handle complex properties like boxShadow and background
            const boxShadow = computedStyle.boxShadow;
            if (boxShadow && boxShadow !== "none") {
              // Replace any modern color functions in boxShadow
              const converted = boxShadow.replace(
                /(oklab|oklch|lab|lch|color-mix)\([^)]+\)/g,
                (match) => {
                  const convertedColor = convertColorToRgb(match);
                  return convertedColor !== match
                    ? convertedColor
                    : "rgb(0, 0, 0)";
                }
              );
              if (converted !== boxShadow) {
                htmlEl.style.boxShadow = converted;
              }
            }

            // Handle background property (can contain gradients with colors)
            const background = computedStyle.background;
            if (background && background !== "none") {
              const converted = background.replace(
                /(oklab|oklch|lab|lch|color-mix)\([^)]+\)/g,
                (match) => {
                  const convertedColor = convertColorToRgb(match, "background");
                  return convertedColor !== match
                    ? convertedColor
                    : "rgb(255, 255, 255)";
                }
              );
              if (converted !== background) {
                htmlEl.style.background = converted;
              }
            }

            // Process all computed style properties to catch any modern color functions
            // This is a safety net to catch colors we might have missed
            for (let i = 0; i < computedStyle.length; i++) {
              const propName = computedStyle[i];
              const value = computedStyle.getPropertyValue(propName);

              // Check if the value contains modern color functions
              if (value && /(oklab|oklch|lab|lch|color-mix)\(/i.test(value)) {
                const converted = value.replace(
                  /(oklab|oklch|lab|lch|color-mix)\([^)]+\)/gi,
                  (match) => {
                    const convertedColor = convertColorToRgb(match);
                    return convertedColor !== match
                      ? convertedColor
                      : "rgb(0, 0, 0)";
                  }
                );
                if (converted !== value) {
                  htmlEl.style.setProperty(propName, converted);
                }
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
      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST"
      );
    }

    pdf.save("my-cv.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};
