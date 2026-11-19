
export function createTether(app, hero, anchorX, anchorY) {
    const SVG_NS = "http://www.w3.org/2000/svg";

    // Create SVG container
    const svg = document.createElementNS(SVG_NS, "svg");

    svg.classList.add("sfx-tether");

    // Create web path
    const web = document.createElementNS(SVG_NS, "path");

    // Set SVG dimensions
    function resize(width, height) {
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }

    resize(app.clientWidth, app.clientHeight);

    // Style web
    web.setAttribute("fill", "none");
    web.setAttribute("stroke", "#FFFFFF");
    web.setAttribute("stroke-width", "3");
    web.setAttribute("stroke-linecap", "round");

    svg.appendChild(web);

    // Insert tether behind superhero
    app.insertBefore(svg, hero);

    // Update anchor position
    function setAnchor(x, y) {
        anchorX = x;
        anchorY = y;
    }

    // Change tether color
    function setColor(color) {
        web.setAttribute("stroke", color);
    }

    // Calculate actual hand position
    function update() {
        const characterSvg = hero.querySelector("svg");

        if (!characterSvg) return;

        const characterMatrix = characterSvg.getScreenCTM();
        const tetherMatrix = svg.getScreenCTM();

        if (!characterMatrix || !tetherMatrix) return;

        // Right-hand attachment point in original SVG coordinates
        const handPoint = characterSvg.createSVGPoint();

        handPoint.x = 215;
        handPoint.y = 190;

        // Convert hand position to screen coordinates
        const screenPoint = handPoint.matrixTransform(characterMatrix);

        // Convert screen coordinates to tether SVG coordinates
        const localPoint = screenPoint.matrixTransform(
            tetherMatrix.inverse()
        );

        // Draw rope directly to the hand
        web.setAttribute(
            "d",
            `M ${anchorX} ${anchorY} L ${localPoint.x} ${localPoint.y}`
        );
    }

    return {
        svg,
        update,
        setAnchor,
        setColor,
        resize,

        destroy() {
            svg.remove();
        }
    };
}
