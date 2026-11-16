
export function createTether(app, hero) {
    // Create SVG container
    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.classList.add("sfx-tether");

    const web = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    const width = app.clientWidth;
    const height = app.clientHeight;

    // Fixed web anchor
    const anchorX = width * 0.65;
    const anchorY = height * 0.08;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    web.setAttribute("fill", "none");
    web.setAttribute("stroke", "#FFFFFF");
    web.setAttribute("stroke-width", "3");
    web.setAttribute("stroke-linecap", "round");

    svg.appendChild(web);
    app.insertBefore(svg, hero);

    // Update web endpoint whenever the hero moves
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
        destroy() {
            svg.remove();
        }
    };
}
