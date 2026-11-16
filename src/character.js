import heroUrl from "./assets/hero.svg";

export function createCharacter() {
    const character = document.createElement("div");

    character.className = "sfx-character";

    const image = document.createElement("img");

    image.src = heroUrl;
    image.alt = "R-Buddy superhero";
    image.draggable = false;

    character.appendChild(image);

    return character;
}