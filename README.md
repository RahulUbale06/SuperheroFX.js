# SuperheroFX.js

A lightweight JavaScript animation library that brings an original superhero character to life with GSAP-powered swinging animations.

**Bring your website to life, one swing at a time.**

## Features

- Original superhero character — R-Buddy.
- GSAP-powered swinging animation.
- Animated web tether.
- Adjustable animation speed.
- Simple lifecycle methods.
- Lightweight JavaScript library.

## Installation

```bash
npm install superhero-fx gsap
```

## Usage

Import the library and its stylesheet:

```javascript
import { SuperheroFX } from "superhero-fx";
import "superhero-fx/style.css";
```

Create a container in your HTML:

```html
<div id="app"></div>
```

Initialize SuperheroFX:

```javascript
const hero = new SuperheroFX({
    container: document.querySelector("#app"),
    speed: 1
});

hero.start();
```

Add basic container styling:

```css
#app {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
}
```

## Configuration

| Option | Default | Description |
|---|---|---|
| `container` | `document.querySelector("#app")` | HTML element where the superhero appears |
| `speed` | `1` | Controls swinging animation speed |

## Available Methods

### `start()`

Starts or resumes the superhero animation.

```javascript
hero.start();
```

### `stop()`

Pauses the animation.

```javascript
hero.stop();
```

### `destroy()`

Removes the superhero, tether, and animation from the container.

```javascript
hero.destroy();
```

To display the superhero again after destroying an instance, create a new instance.

## Technologies Used

- JavaScript
- GSAP
- SVG
- CSS
- Vite

## Project Status

Currently under development. More features and customization options are planned.

## Author

**Rahul Ubale**

GitHub: [RahulUbale06](https://github.com/RahulUbale06)

## License

MIT License
