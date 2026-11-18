
import { gsap } from "gsap";
import { createCharacter } from "../character.js";
import { createTether } from "../renderer/tether.js";
import { resolveTheme } from "../themes.js";

export class SuperheroFX {
    constructor({
        container = document.querySelector("#app"),
        speed = 1,
        position = { x: 0.65, y: 0.08 },
        size = { width: 180, height: 225 },
        theme = "classic"
    } = {}) {

        // Validate configuration
        if (!container) {
            throw new Error(
                "SuperheroFX: Container element not found."
            );
        }

        if (
            typeof speed !== "number" ||
            !Number.isFinite(speed) ||
            speed <= 0
        ) {
            throw new Error(
                "SuperheroFX: Speed must be a positive number."
            );
        }

        this.container = container;
        this.speed = speed;
        this.position = position;
        this.size = size;
        this.theme = resolveTheme(theme);

        // Animation and component references
        this.animation = null;
        this.resizeObserver = null;
        this.tether = null;
        this.hero = null;

        // Swing configuration
        this.swing = {
            angle: -0.75
        };

        // Adaptive animation configuration
        this.swingDirection = -1;
        this.swingCount = 0;

        this.animationSettings = {
            minAngle: 0.55,
            maxAngle: 0.85,
            minDuration: 1.7,
            maxDuration: 2.8
        };

        // Lifecycle states
        this.isDestroyed = false;
        this.isReady = false;

        // Initialize asynchronously
        this.ready = this.initialize();
    }

    // Initialize superhero and its components
    async initialize() {
        try {
            this.hero = await createCharacter();

            // Stop if instance was destroyed during loading
            if (this.isDestroyed) {
                return;
            }

            // Apply selected theme
            this.applyTheme();

            // Configure superhero
            this.hero.style.width = `${this.size.width}px`;
            this.hero.style.height = `${this.size.height}px`;
            this.hero.style.position = "absolute";
            this.hero.style.left = "0px";
            this.hero.style.top = "0px";

            this.container.appendChild(this.hero);

            // Create tether
            this.tether = createTether(
                this.container,
                this.hero,
                0,
                0
            );

            // Apply theme tether color
            this.tether.setColor(this.theme.tether);

            // Calculate initial layout
            this.updateLayout();

            // Observe container resizing
            this.resizeObserver = new ResizeObserver(() => {
                this.updateLayout();
            });

            this.resizeObserver.observe(this.container);

            this.isReady = true;

        } catch (error) {
            throw new Error(
                `SuperheroFX: Failed to initialize. ${error.message}`
            );
        }
    }

    // Apply theme colors to inline SVG
    applyTheme() {
        const cssVariables = {
            primary: "--sfx-primary",
            primaryDark: "--sfx-primary-dark",
            secondary: "--sfx-secondary",
            secondaryDark: "--sfx-secondary-dark",
            cape: "--sfx-cape",
            capeDark: "--sfx-cape-dark",
            capeHighlight: "--sfx-cape-highlight",
            emblem: "--sfx-emblem",
            emblemDark: "--sfx-emblem-dark",
            outline: "--sfx-outline",
            accent: "--sfx-accent"
        };

        const svg = this.hero.querySelector("svg");

        if (!svg) {
            throw new Error(
                "SuperheroFX: Character SVG not found."
            );
        }

        Object.entries(cssVariables).forEach(([key, variable]) => {
            svg.style.setProperty(
                variable,
                this.theme[key]
            );
        });
    }

    // Generate a random number within a range
    getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Calculate responsive layout
    updateLayout() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (!width || !height || !this.hero || !this.tether) {
            return;
        }

        // Calculate anchor position
        this.anchorX = width * this.position.x;
        this.anchorY = height * this.position.y;

        // Calculate available swing space
        const horizontalSpace = Math.max(
            0,
            Math.min(
                this.anchorX - this.size.width / 2,
                width - this.anchorX - this.size.width / 2
            )
        );

        const verticalSpace = Math.max(
            0,
            height - this.anchorY - this.size.height / 2
        );

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

        // Update tether anchor and dimensions
        this.tether.setAnchor(
            this.anchorX,
            this.anchorY
        );

        this.tether.resize(width, height);

        // Update superhero position
        this.updateSwing();
    }

    // Update superhero and tether positions
    updateSwing() {
        if (!this.hero || !this.tether) {
            return;
        }

        const x =
            this.anchorX +
            this.ropeLength * Math.sin(this.swing.angle);

        const y =
            this.anchorY +
            this.ropeLength * Math.cos(this.swing.angle);

        // Move superhero
        gsap.set(this.hero, {
            x,
            y,
            xPercent: -50,
            yPercent: -50
        });

        // Rotate superhero SVG
        gsap.set(this.hero.querySelector("svg"), {
            rotation: this.swing.angle * 18,
            transformOrigin: "50% 80%"
        });

        // Update tether endpoint
        this.tether.update(x, y);
    }

    // Start the next adaptive swing
    animateSwing() {
        if (this.isDestroyed || !this.isReady) {
            return;
        }

        const settings = this.animationSettings;

        // Alternate between left and right
        this.swingDirection *= -1;

        // Generate a random swing angle
        const angle =
            this.swingDirection *
            this.getRandom(
                settings.minAngle,
                settings.maxAngle
            );

        // Generate a random duration
        const duration =
            this.getRandom(
                settings.minDuration,
                settings.maxDuration
            ) / this.speed;

        // Animate to the next position
        this.animation = gsap.to(this.swing, {
            angle,
            duration,
            ease: "sine.inOut",

            onUpdate: () => {
                this.updateSwing();
            },

            onComplete: () => {
                if (this.isDestroyed) {
                    return;
                }

                // Count completed swing movements
                this.swingCount++;

                // Start another adaptive swing
                this.animateSwing();
            }
        });
    }

    // Start or resume swinging animation
    start() {
        if (this.isDestroyed) {
            return Promise.resolve();
        }

        return this.ready.then(() => {
            if (this.isDestroyed || !this.isReady) {
                return;
            }

            // Resume existing animation
            if (this.animation) {
                this.animation.resume();
                return;
            }

            // Start adaptive animation
            this.animateSwing();
        });
    }

    // Pause animation
    stop() {
        if (!this.animation) {
            return;
        }

        this.animation.pause();
    }

    // Destroy superhero and clean up resources
    destroy() {
        if (this.isDestroyed) {
            return;
        }

        this.isDestroyed = true;

        // Kill GSAP animation
        if (this.animation) {
            this.animation.kill();
            this.animation = null;
        }

        // Stop observing container
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        // Remove tether
        if (this.tether) {
            this.tether.destroy();
            this.tether = null;
        }

        // Remove superhero
        if (this.hero) {
            this.hero.remove();
            this.hero = null;
        }

        this.isReady = false;
    }
}
