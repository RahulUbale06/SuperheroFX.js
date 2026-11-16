
import { gsap } from "gsap";
import { createCharacter } from "../character.js";
import { createTether } from "../renderer/tether.js";

export class SuperheroFX {
    constructor({
        container = document.querySelector("#app"),
        speed = 1,
        position = { x: 0.65, y: 0.08 },
        size = { width: 180, height: 225 }
    } = {}) {
        if (!container) {
            throw new Error(
                "SuperheroFX: Container element not found."
            );
        }

        if (speed <= 0) {
            throw new Error(
                "SuperheroFX: Speed must be greater than 0."
            );
        }

        this.container = container;
        this.speed = speed;

        // Create superhero
        this.hero = createCharacter();

        this.hero.style.width = `${size.width}px`;
        this.hero.style.height = `${size.height}px`;
        this.hero.style.position = "absolute";
        this.hero.style.left = "0px";
        this.hero.style.top = "0px";

        this.container.appendChild(this.hero);

        // Calculate container dimensions
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // Calculate configurable web anchor
        this.anchorX = width * position.x;
        this.anchorY = height * position.y;

        // Calculate available swing space
        const horizontalSpace = Math.min(
            this.anchorX - size.width / 2,
            width - this.anchorX - size.width / 2
        );

        const verticalSpace =
            height - this.anchorY - size.height / 2;

        // Calculate safe rope length
        this.ropeLength = Math.max(
            0,
            Math.min(
                width * 0.3,
                250,
                horizontalSpace / Math.sin(0.75),
                verticalSpace / Math.cos(0.75)
            )
        );

        // Create tether using the same anchor
        this.tether = createTether(
            this.container,
            this.hero,
            this.anchorX,
            this.anchorY
        );

        // Swing configuration
        this.swing = {
            angle: -0.75
        };

        this.animation = null;

        this.updateSwing();
    }

    updateSwing() {
        const x =
            this.anchorX +
            this.ropeLength * Math.sin(this.swing.angle);

        const y =
            this.anchorY +
            this.ropeLength * Math.cos(this.swing.angle);

        gsap.set(this.hero, {
            x,
            y,
            xPercent: -50,
            yPercent: -50
        });

        gsap.set(this.hero.querySelector("img"), {
            rotation: this.swing.angle * 18,
            transformOrigin: "50% 80%"
        });

        this.tether.update(x, y);
    }

    start() {
        if (this.animation) {
            this.animation.resume();
            return;
        }

        this.animation = gsap.to(this.swing, {
            angle: 0.75,
            duration: 2.2 / this.speed,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            onUpdate: () => this.updateSwing()
        });
    }

    stop() {
        if (!this.animation) return;

        this.animation.pause();
    }

    destroy() {
        if (this.animation) {
            this.animation.kill();
            this.animation = null;
        }

        this.tether.destroy();
        this.hero.remove();
    }
}
