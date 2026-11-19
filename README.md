# SuperheroFX.js 🦸

A lightweight JavaScript animation library that brings an original superhero character to life with GSAP-powered swinging animations.

**Bring your website to life, one swing at a time.**

## ✨ Features

- **Original superhero character:** Meet R-Buddy.
- **GSAP-powered animations:** Smooth, automatic swinging.
- **Animated web tether:** A dynamic tether that follows the character.
- **Dynamic cape animation:** An animated superhero cape.
- **Cursor tracking:** R-Buddy follows your mouse movement.
- **Facial animations:** Automatic eye blinking and expressive eyebrows.
- **Special actions:** Flip, quick swing, and hanging animations.
- **Multiple themes:** Four built-in themes and custom theme support.
- **Customizable settings:** Adjust animation speed, position, and character size.
- **Lifecycle methods:** Start, stop, and destroy animations.

## 📦 Installation

Install SuperheroFX.js and its GSAP dependency:

```bash
npm install superhero-fx gsap
```

## 🚀 Usage

### 1. Import the library

```javascript
import { SuperheroFX } from "superhero-fx";
import "superhero-fx/style.css";
```

### 2. Create a container

Add a container to your HTML:

```html
<div id="app"></div>
```

### 3. Initialize SuperheroFX

```javascript
const hero = new SuperheroFX({
    container: document.querySelector("#app"),
    speed: 1
});

// Wait for initialization
await hero.ready;

// Start the animation
await hero.start();
```

### 4. Add container styling

```css
#app {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
}
```

## ⚙️ Configuration

SuperheroFX.js supports the following configuration options:

| Option | Default | Description |
|---|---|---|
| `container` | `document.querySelector("#app")` | HTML element where the superhero appears |
| `speed` | `1` | Controls animation speed |
| `position` | `{ x: 0.65, y: 0.08 }` | Initial character position (normalized coordinates) |
| `size` | `{ width: 180, height: 225 }` | Character dimensions in pixels |
| `theme` | `"classic"` | Character color theme |

### Example

```javascript
const hero = new SuperheroFX({
    container: document.querySelector("#app"),
    speed: 1.2,
    position: { x: 0.65, y: 0.08 },
    size: { width: 180, height: 225 },
    theme: "ocean"
});

await hero.ready;
await hero.start();
```

## 🎨 Available Themes

SuperheroFX.js includes four built-in themes:

- `classic`
- `shadow`
- `ocean`
- `emerald`

You can also provide a custom theme configuration to customize the character's colors.

## 🎮 Available Methods

### `start()`

Starts or resumes the superhero animation.

```javascript
await hero.start();
```

### `stop()`

Stops the animation.

```javascript
hero.stop();
```

### `destroy()`

Removes the superhero, tether, and associated animations and event listeners.

```javascript
hero.destroy();
```

To display the superhero again after destroying an instance, create a new instance.

## 🛠️ Technologies Used

- JavaScript
- GSAP
- SVG
- CSS
- Vite

## 📌 Project Status

**Current Version: 0.1.0**

SuperheroFX.js is an actively developed JavaScript animation library. More features and customization options are planned for future releases.

## 👨‍💻 Author

**Rahul Ubale**

- GitHub: [RahulUbale06](https://github.com/RahulUbale06)

## 📄 License

This project is licensed under the [MIT License](LICENSE).