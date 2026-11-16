
import "./styles/style.css";
import { SuperheroFX } from "./index.js";

// Create superhero instance
const hero = new SuperheroFX({
    container: document.querySelector("#app"),
    speed: 1
});

// Start swinging
hero.start();

// Temporary: expose instance for browser console testing
window.hero = hero;

console.log("SuperheroFX library initialized!");
