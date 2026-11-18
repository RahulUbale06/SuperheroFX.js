
import heroUrl from "./assets/hero.svg";

export async function createCharacter() {
    const response = await fetch(heroUrl);

    if (!response.ok) {
        throw new Error(
            "SuperheroFX: Failed to load character SVG."
        );
    }

    const svgMarkup = await response.text();

    const character = document.createElement("div");
    character.className = "sfx-character";

    character.innerHTML = svgMarkup;

    const svg = character.querySelector("svg");

    if (!svg) {
        throw new Error(
            "SuperheroFX: Invalid character SVG."
        );
    }

    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    return character;
}
