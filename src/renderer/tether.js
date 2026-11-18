
export function createTether(app, hero, anchorX, anchorY) {
    // Create SVG container
    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.classList.add("sfx-tether");

    // Create web path
    const web = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    // Set initial SVG dimensions
    function resize(width, height) {
        svg.setAttribute(
            "viewBox",
            `0 0 ${width} ${height}`
        );
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

    // Update web endpoint whenever superhero moves
    function update(heroX, heroY) {
        const handX = heroX + 45;
        const handY = heroY - 20;

        web.setAttribute(
            "d",
            `M ${anchorX} ${anchorY} L ${handX} ${handY}`
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
