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
        // Validate container
        if (
            !container ||
            container.nodeType !== 1 ||
            typeof container.appendChild !== "function" ||
            !container.style
        ) {
            throw new Error(
                "SuperheroFX: Container must be a valid HTML element."
            );
        }

        // Validate animation speed
        if (
            typeof speed !== "number" ||
            !Number.isFinite(speed) ||
            speed <= 0
        ) {
            throw new Error(
                "SuperheroFX: Speed must be a positive finite number."
            );
        }

        // Validate position (normalized values between 0 and 1)
        if (
            !position ||
            typeof position !== "object" ||
            Array.isArray(position) ||
            typeof position.x !== "number" ||
            !Number.isFinite(position.x) ||
            position.x < 0 ||
            position.x > 1 ||
            typeof position.y !== "number" ||
            !Number.isFinite(position.y) ||
            position.y < 0 ||
            position.y > 1
        ) {
            throw new Error(
                "SuperheroFX: Position must contain finite x and y values between 0 and 1."
            );
        }

        // Validate character dimensions
        if (
            !size ||
            typeof size !== "object" ||
            Array.isArray(size) ||
            typeof size.width !== "number" ||
            !Number.isFinite(size.width) ||
            size.width <= 0 ||
            typeof size.height !== "number" ||
            !Number.isFinite(size.height) ||
            size.height <= 0
        ) {
            throw new Error(
                "SuperheroFX: Size must contain positive finite width and height values."
            );
        }

        this.container = container;
        this.speed = speed;
        this.position = { x: position.x, y: position.y };
        this.size = { width: size.width, height: size.height };
        this.theme = resolveTheme(theme);

        // Preserve original container positioning
        this.originalContainerPosition = container.style.position;
        this.changedContainerPosition = false;

        if (getComputedStyle(container).position === "static") {
            container.style.position = "relative";
            this.changedContainerPosition = true;
        }

        // Component references
        this.animation = null;
        this.capeAnimation = null;
        this.resizeObserver = null;
        this.tether = null;
        this.hero = null;

        // Arm references
        this.leftArm = null;
        this.rightArm = null;

        // Cape reference
        this.cape = null;

        // Head reference
        this.head = null;

        // Eye references
        this.leftEye = null;
        this.rightEye = null;

        // Pupil references
        this.leftPupil = null;
        this.rightPupil = null;

        // Cursor tracking
        this.pointerMoveHandler = (event) => {
            this.handlePointerMove(event);
        };

        this.pointerLeaveHandler = () => {
            this.resetPointerTracking();
        };

        this.isPointerTracking = false;

        // Eyebrow references
        this.leftEyebrow = null;
        this.rightEyebrow = null;

        // Blinking animation references
        this.blinkTimer = null;
        this.blinkAnimation = null;

        // Swing configuration
        this.swing = {
            angle: -0.75
        };

        this.swingDirection = -1;
        this.swingCount = 0;
        this.heroRotation = 0;

        // Adaptive animation settings
        this.animationSettings = {
            minAngle: 0.55,
            maxAngle: 0.85,
            minDuration: 1.7,
            maxDuration: 2.8
        };

        // Special action settings
        this.specialAction = null;

        this.specialActionSettings = {
            minInterval: 4,
            maxInterval: 6
        };

        this.nextSpecialAction = this.getRandomInterval();

        // Lifecycle states
        this.isDestroyed = false;
        this.isReady = false;

        // Initialize
        this.ready = this.initialize();
    }

    // Generate random number
    getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Generate random interval
    getRandomInterval() {
        return Math.floor(
            this.getRandom(
                this.specialActionSettings.minInterval,
                this.specialActionSettings.maxInterval + 1
            )
        );
    }

    // Initialize superhero
    async initialize() {
        try {
            this.hero = await createCharacter();

            // Check whether the instance was destroyed while loading
            if (this.isDestroyed) {
                this.hero?.remove();
                this.hero = null;
                return;
            }

            this.applyTheme();

            // Get animated arm elements
            this.leftArm = this.hero.querySelector("#sfx-left-arm");
            this.rightArm = this.hero.querySelector("#sfx-right-arm");

            if (!this.leftArm || !this.rightArm) {
                throw new Error(
                    "SuperheroFX: Character arm elements not found."
                );
            }

            // Get cape element
            this.cape = this.hero.querySelector("#sfx-cape");

            if (!this.cape) {
                throw new Error(
                    "SuperheroFX: Cape element not found."
                );
            }

            // Get complete head group
            this.head = this.hero.querySelector("#sfx-head");

            if (!this.head) {
                throw new Error(
                    "SuperheroFX: Character head element not found. " +
                    "Check that hero.svg contains the sfx-head ID."
                );
            }

            // Get eye elements
            this.leftEye = this.hero.querySelector("#sfx-left-eye");
            this.rightEye = this.hero.querySelector("#sfx-right-eye");

            if (!this.leftEye || !this.rightEye) {
                throw new Error(
                    "SuperheroFX: Character eye elements not found."
                );
            }

            // Get pupils for cursor gaze tracking
            this.leftPupil = this.hero.querySelector("#sfx-left-pupil");
            this.rightPupil = this.hero.querySelector("#sfx-right-pupil");

            // Pupils are optional for backward compatibility
            if (this.leftPupil && this.rightPupil) {
                gsap.set(
                    [this.leftPupil, this.rightPupil],
                    {
                        x: 0,
                        y: 0,
                        transformOrigin: "50% 50%"
                    }
                );
            }

            // Get eyebrow elements
            this.leftEyebrow = this.hero.querySelector("#sfx-left-eyebrow");
            this.rightEyebrow = this.hero.querySelector("#sfx-right-eyebrow");

            if (!this.leftEyebrow || !this.rightEyebrow) {
                throw new Error(
                    "SuperheroFX: Character eyebrow elements not found. " +
                    "Check the eyebrow IDs in hero.svg."
                );
            }

            // Set arm rotation pivots
            gsap.set(this.leftArm, {
                svgOrigin: "76 125",
                rotation: 0
            });

            gsap.set(this.rightArm, {
                svgOrigin: "158 125",
                rotation: 0
            });

            // Set cape rotation pivot
            gsap.set(this.cape, {
                svgOrigin: "120 120",
                rotation: 0,
                scaleX: 1,
                scaleY: 1
            });

            // Configure eye transform origins
            gsap.set(
                [this.leftEye, this.rightEye],
                {
                    transformOrigin: "50% 50%",
                    scaleY: 1
                }
            );

            // Configure eyebrow transform origins
            gsap.set(
                [this.leftEyebrow, this.rightEyebrow],
                {
                    transformOrigin: "50% 50%",
                    rotation: 0,
                    y: 0
                }
            );

            // Configure character
            this.hero.style.width = `${this.size.width}px`;
            this.hero.style.height = `${this.size.height}px`;
            this.hero.style.position = "absolute";
            this.hero.style.left = "0px";
            this.hero.style.top = "0px";

            this.container.appendChild(this.hero);

            // Listen for cursor movement
            this.container.addEventListener(
                "pointermove",
                this.pointerMoveHandler
            );

            this.container.addEventListener(
                "pointerleave",
                this.pointerLeaveHandler
            );

            this.isPointerTracking = true;

            // Create tether
            this.tether = createTether(
                this.container,
                this.hero,
                0,
                0
            );

            this.tether.setColor(this.theme.tether);

            // Initial layout
            this.updateLayout();

            // Responsive layout
            this.resizeObserver = new ResizeObserver(() => {
                this.updateLayout();
            });

            this.resizeObserver.observe(this.container);

            this.isReady = true;

        } catch (error) {
            // Clean up partial initialization
            this.destroy();

            throw new Error(
                `SuperheroFX: Failed to initialize. ${error.message}`
            );
        }
    }

    // Make the head follow the pointer and move pupils toward the cursor
    handlePointerMove(event) {
        if (!this.hero || !this.head || this.isDestroyed) {
            return;
        }

        const rect = this.hero.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        // Estimate the face center within the character
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * 0.22;

        // Normalize pointer position around the face
        const horizontal = (event.clientX - centerX) / (rect.width / 2);
        const vertical = (event.clientY - centerY) / (rect.height / 2);

        const normalizedX = Math.max(-1, Math.min(1, horizontal));
        const normalizedY = Math.max(-1, Math.min(1, vertical));

        // Subtle head movement
        gsap.to(this.head, {
            x: normalizedX * 5,
            y: normalizedY * 3,
            rotation: normalizedX * 4,
            transformOrigin: "50% 50%",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
        });

        // Move pupils independently inside the eyes
        if (this.leftPupil && this.rightPupil) {
            const pupilX = normalizedX * 2.5;
            const pupilY = normalizedY * 1.5;

            gsap.to(
                [this.leftPupil, this.rightPupil],
                {
                    x: pupilX,
                    y: pupilY,
                    duration: 0.18,
                    ease: "power2.out",
                    overwrite: "auto"
                }
            );
        }
    }

    // Return the head and pupils to their normal positions
    resetPointerTracking() {
        if (!this.head || this.isDestroyed) {
            return;
        }

        gsap.to(this.head, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto"
        });

        if (this.leftPupil && this.rightPupil) {
            gsap.to(
                [this.leftPupil, this.rightPupil],
                {
                    x: 0,
                    y: 0,
                    duration: 0.25,
                    ease: "power2.out",
                    overwrite: "auto"
                }
            );
        }
    }

    // Apply theme colors
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
            svg.style.setProperty(variable, this.theme[key]);
        });
    }

    // Calculate responsive layout
    updateLayout() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (!width || !height || !this.hero || !this.tether) {
            return;
        }

        this.anchorX = width * this.position.x;
        this.anchorY = height * this.position.y;

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

        this.ropeLength = Math.max(
            0,
            Math.min(
                width * 0.3,
                250,
                horizontalSpace / Math.sin(0.85),
                verticalSpace / Math.cos(0.85)
            )
        );

        this.tether.setAnchor(
            this.anchorX,
            this.anchorY
        );

        this.tether.resize(width, height);

        this.updateSwing();
    }

    // Update character and tether position
    updateSwing() {
        if (
            !this.hero ||
            !this.tether ||
            this.anchorX === undefined ||
            this.ropeLength === undefined
        ) {
            return;
        }

        const x =
            this.anchorX +
            this.ropeLength * Math.sin(this.swing.angle);

        const y =
            this.anchorY +
            this.ropeLength * Math.cos(this.swing.angle);

        // Move character
        gsap.set(this.hero, {
            x,
            y,
            xPercent: -50,
            yPercent: -50
        });

        // Rotate character body
        const svg = this.hero.querySelector("svg");

        if (svg) {
            gsap.set(svg, {
                rotation: this.swing.angle * 18 + this.heroRotation,
                transformOrigin: "50% 80%"
            });
        }

        this.tether.update();
    }

    // Start normal cape flutter
    startCapeAnimation() {
        if (!this.cape || this.isDestroyed) return;

        if (this.capeAnimation) {
            this.capeAnimation.kill();
            this.capeAnimation = null;
        }

        gsap.set(this.cape, {
            rotation: 0,
            scaleX: 1
        });

        this.capeAnimation = gsap.to(this.cape, {
            rotation: 4,
            duration: 0.8 / this.speed,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    // Schedule the next eye blink
    scheduleBlink() {
        if (
            this.isDestroyed ||
            !this.isReady ||
            !this.leftEye ||
            !this.rightEye ||
            this.blinkTimer ||
            this.blinkAnimation
        ) {
            return;
        }

        const delay = this.getRandom(3, 6);

        this.blinkTimer = gsap.delayedCall(delay, () => {
            this.blinkTimer = null;

            if (this.isDestroyed) return;

            this.blinkAnimation = gsap.timeline({
                onComplete: () => {
                    this.blinkAnimation = null;
                    this.scheduleBlink();
                }
            });

            // Close both eyes
            this.blinkAnimation.to(
                [this.leftEye, this.rightEye],
                {
                    scaleY: 0.08,
                    duration: 0.09 / this.speed,
                    ease: "power2.in"
                }
            );

            // Reopen both eyes
            this.blinkAnimation.to(
                [this.leftEye, this.rightEye],
                {
                    scaleY: 1,
                    duration: 0.12 / this.speed,
                    ease: "power2.out"
                }
            );
        });
    }

    // Animate facial expressions
    animateExpression(expression, timeline) {
        if (
            !this.leftEyebrow ||
            !this.rightEyebrow ||
            !timeline
        ) {
            return;
        }

        const expressions = {
            confident: {
                leftRotation: 0,
                rightRotation: 0,
                y: 0
            },

            surprised: {
                leftRotation: -12,
                rightRotation: 12,
                y: -3
            },

            determined: {
                leftRotation: 12,
                rightRotation: -12,
                y: 2
            }
        };

        const selected =
            expressions[expression] || expressions.confident;

        // Move eyebrows vertically
        timeline.to(
            [this.leftEyebrow, this.rightEyebrow],
            {
                duration: 0.2 / this.speed,
                ease: "power2.out",
                y: selected.y
            },
            0
        );

        // Rotate left eyebrow
        timeline.to(
            this.leftEyebrow,
            {
                rotation: selected.leftRotation,
                duration: 0.2 / this.speed,
                ease: "power2.out"
            },
            0
        );

        // Rotate right eyebrow
        timeline.to(
            this.rightEyebrow,
            {
                rotation: selected.rightRotation,
                duration: 0.2 / this.speed,
                ease: "power2.out"
            },
            0
        );
    }

    // Restore arms to their normal position
    resetArms(timeline) {
        timeline.to(
            [this.leftArm, this.rightArm],
            {
                rotation: 0,
                duration: 0.35 / this.speed,
                ease: "back.out(1.5)"
            }
        );
    }

    // Perform a random special action
    triggerSpecialAction() {
        const actions = [
            "flip",
            "quickSwing",
            "hang"
        ];

        const randomIndex = Math.floor(
            Math.random() * actions.length
        );

        this.specialAction = actions[randomIndex];

        console.log(
            `SuperheroFX: Performing ${this.specialAction}`
        );

        // Pause normal cape flutter
        if (this.capeAnimation) {
            this.capeAnimation.kill();
            this.capeAnimation = null;
        }

        // Completion is handled by animateSwing()
        const timeline = gsap.timeline();

        // Give each special action its own facial expression
        if (this.specialAction === "flip") {
            this.animateExpression("determined", timeline);
        } else if (this.specialAction === "quickSwing") {
            this.animateExpression("surprised", timeline);
        } else {
            this.animateExpression("confident", timeline);
        }

        // ACTION 1: FLIP
        if (this.specialAction === "flip") {
            timeline.to(
                this.leftArm,
                {
                    rotation: -35,
                    duration: 0.3 / this.speed,
                    ease: "power2.out"
                },
                0
            );

            timeline.to(
                this.rightArm,
                {
                    rotation: 35,
                    duration: 0.3 / this.speed,
                    ease: "power2.out"
                },
                0
            );

            // Cape spreads during flip
            timeline.to(
                this.cape,
                {
                    rotation: 28,
                    scaleX: 1.12,
                    duration: 0.45 / this.speed,
                    ease: "power2.out"
                },
                0
            );

            // Full 360-degree rotation
            timeline.to(this, {
                heroRotation: 360,
                duration: 0.85 / this.speed,
                ease: "power2.inOut",
                onUpdate: () => this.updateSwing()
            }, 0);

            timeline.set(this, {
                heroRotation: 0,
                onUpdate: () => this.updateSwing()
            });

            // Restore cape
            timeline.to(this.cape, {
                rotation: 0,
                scaleX: 1,
                duration: 0.35 / this.speed,
                ease: "power2.out"
            });

            this.resetArms(timeline);
        }

        // ACTION 2: QUICK SWING
        else if (this.specialAction === "quickSwing") {
            timeline.to(
                this.rightArm,
                {
                    rotation: -65,
                    duration: 0.25 / this.speed,
                    ease: "power2.out"
                },
                0
            );

            timeline.to(
                this.leftArm,
                {
                    rotation: 20,
                    duration: 0.25 / this.speed,
                    ease: "power2.out"
                },
                0
            );

            // Cape reacts to quick movement
            timeline.to(
                this.cape,
                {
                    rotation: -22,
                    scaleX: 1.08,
                    duration: 0.3 / this.speed,
                    ease: "power2.out"
                },
                0
            );

            timeline.to(this.swing, {
                angle: -this.swing.angle,
                duration: 0.4 / this.speed,
                ease: "power2.inOut",
                onUpdate: () => this.updateSwing()
            }, 0);

            timeline.to(this.cape, {
                rotation: 0,
                scaleX: 1,
                duration: 0.35 / this.speed,
                ease: "sine.out"
            });

            this.resetArms(timeline);
        }

        // ACTION 3: HANG
        else if (this.specialAction === "hang") {
            timeline.to(
                this.rightArm,
                {
                    rotation: -140,
                    duration: 0.4 / this.speed,
                    ease: "back.out(1.4)"
                },
                0
            );

            timeline.to(
                this.leftArm,
                {
                    rotation: 15,
                    duration: 0.4 / this.speed,
                    ease: "power2.out"
                },
                0
            );

            // Cape settles while hanging
            timeline.to(
                this.cape,
                {
                    rotation: 8,
                    scaleX: 0.96,
                    duration: 0.5 / this.speed,
                    ease: "sine.out"
                },
                0
            );

            timeline.to(this.swing, {
                angle: 0,
                duration: 0.5 / this.speed,
                ease: "power2.out",
                onUpdate: () => this.updateSwing()
            }, 0);

            // Hold hanging pose
            timeline.to({}, {
                duration: 1.2 / this.speed
            });

            timeline.to(this.cape, {
                rotation: 0,
                scaleX: 1,
                duration: 0.4 / this.speed,
                ease: "sine.inOut"
            });

            this.resetArms(timeline);
        }

        // Restore the normal confident expression
        timeline.to(
            [this.leftEyebrow, this.rightEyebrow],
            {
                rotation: 0,
                y: 0,
                duration: 0.25 / this.speed,
                ease: "power2.inOut"
            }
        );

        return timeline;
    }

    // Start next adaptive swing
    animateSwing() {
        if (this.isDestroyed || !this.isReady) {
            return;
        }

        const settings = this.animationSettings;

        // Alternate swing direction
        this.swingDirection *= -1;

        // Random swing angle
        const angle =
            this.swingDirection *
            this.getRandom(
                settings.minAngle,
                settings.maxAngle
            );

        // Random duration
        const duration =
            this.getRandom(
                settings.minDuration,
                settings.maxDuration
            ) / this.speed;

        this.animation = gsap.to(this.swing, {
            angle,
            duration,
            ease: "sine.inOut",

            onUpdate: () => {
                this.updateSwing();
            },

            onComplete: () => {
                if (this.isDestroyed) return;

                this.swingCount++;

                // Check if a special action is due
                if (this.swingCount >= this.nextSpecialAction) {
                    this.nextSpecialAction =
                        this.swingCount + this.getRandomInterval();

                    const specialTimeline = this.triggerSpecialAction();

                    this.animation = specialTimeline;

                    specialTimeline.eventCallback("onComplete", () => {
                        this.specialAction = null;

                        if (!this.isDestroyed) {
                            this.startCapeAnimation();
                            this.animateSwing();
                        }
                    });

                } else {
                    this.animateSwing();
                }
            }
        });
    }

    // Start or resume animation
    start() {
        if (this.isDestroyed) {
            return Promise.resolve();
        }

        return this.ready.then(() => {
            if (this.isDestroyed || !this.isReady) {
                return;
            }

            if (this.animation) {
                this.animation.resume();

                if (this.capeAnimation) {
                    this.capeAnimation.resume();
                }

                if (this.blinkAnimation) {
                    this.blinkAnimation.resume();
                }

                if (this.blinkTimer) {
                    this.blinkTimer.resume();
                } else if (!this.blinkAnimation) {
                    this.scheduleBlink();
                }

                return;
            }

            this.startCapeAnimation();
            this.scheduleBlink();
            this.animateSwing();
        });
    }

    // Pause animation
    stop() {
        if (this.animation) {
            this.animation.pause();
        }

        if (this.capeAnimation) {
            this.capeAnimation.pause();
        }

        if (this.blinkAnimation) {
            this.blinkAnimation.pause();
        }

        if (this.blinkTimer) {
            this.blinkTimer.pause();
        }
    }

    // Destroy component
    destroy() {
        if (this.isDestroyed) return;

        this.isDestroyed = true;

        if (this.animation) {
            this.animation.kill();
            this.animation = null;
        }

        if (this.capeAnimation) {
            this.capeAnimation.kill();
            this.capeAnimation = null;
        }

        if (this.blinkTimer) {
            this.blinkTimer.kill();
            this.blinkTimer = null;
        }

        if (this.blinkAnimation) {
            this.blinkAnimation.kill();
            this.blinkAnimation = null;
        }

        // Stop remaining GSAP tweens
        gsap.killTweensOf([
            this.head,
            this.leftPupil,
            this.rightPupil,
            this.leftArm,
            this.rightArm,
            this.cape,
            this.leftEye,
            this.rightEye,
            this.leftEyebrow,
            this.rightEyebrow
        ].filter(Boolean));

        // Remove cursor tracking listeners
        if (this.isPointerTracking && this.container) {
            this.container.removeEventListener(
                "pointermove",
                this.pointerMoveHandler
            );

            this.container.removeEventListener(
                "pointerleave",
                this.pointerLeaveHandler
            );

            this.isPointerTracking = false;
        }

        // Disconnect resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        // Remove tether
        if (this.tether) {
            this.tether.destroy();
            this.tether = null;
        }

        // Remove character
        if (this.hero) {
            this.hero.remove();
            this.hero = null;
        }

        // Restore original container positioning
        if (this.changedContainerPosition) {
            this.container.style.position =
                this.originalContainerPosition;
        }

        this.isReady = false;
    }
}