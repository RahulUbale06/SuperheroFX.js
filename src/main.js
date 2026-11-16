
import "./styles/style.css";

import { gsap } from "gsap";
import { createCharacter } from "./character.js";
import { createTether } from "./renderer/tether.js";

const app = document.querySelector("#app");

// Create R-Buddy
const hero = createCharacter();
app.appendChild(hero);

// Position the character using GSAP
hero.style.position = "absolute";
hero.style.left = "0px";
hero.style.top = "0px";

// Create tether
const tether = createTether(app, hero);

// Swing configuration
const width = app.clientWidth;
const height = app.clientHeight;

const anchorX = width * 0.65;
const anchorY = height * 0.08;

const ropeLength = Math.min(width * 0.3, 300);

// Swing angle
const swing = {
    angle: -0.75
};

// Update character position
function updateSwing() {
    const x = anchorX + ropeLength * Math.sin(swing.angle);
    const y = anchorY + ropeLength * Math.cos(swing.angle);

    // Move R-Buddy
    gsap.set(hero, {
        x,
        y,
        xPercent: -50,
        yPercent: -50
    });

    // Rotate his body slightly
    gsap.set(hero.querySelector("img"), {
        rotation: swing.angle * 18,
        transformOrigin: "50% 80%"
    });

    // Keep web connected
    tether.update(x, y);
}

// Initial position
updateSwing();

// Animate swinging motion
gsap.to(swing, {
    angle: 0.75,
    duration: 2.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    onUpdate: updateSwing
});

console.log("R-Buddy is swinging!");
