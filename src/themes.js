
const themes = {
    classic: {
        primary: "#FF6868",
        primaryDark: "#C91F3D",
        secondary: "#344B8D",
        secondaryDark: "#151D42",
        cape: "#A65BFF",
        capeDark: "#5424A0",
        capeHighlight: "#C38BFF",
        emblem: "#FFF08A",
        emblemDark: "#FFB900",
        outline: "#17152E",
        accent: "#FFD04A",
        tether: "#FFFFFF"
    },

    shadow: {
        primary: "#7C3AED",
        primaryDark: "#4C1D95",
        secondary: "#27272A",
        secondaryDark: "#09090B",
        cape: "#A78BFA",
        capeDark: "#5B21B6",
        capeHighlight: "#C4B5FD",
        emblem: "#FDE047",
        emblemDark: "#EAB308",
        outline: "#18181B",
        accent: "#FACC15",
        tether: "#C4B5FD"
    },

    ocean: {
        primary: "#0EA5E9",
        primaryDark: "#0369A1",
        secondary: "#164E63",
        secondaryDark: "#082F49",
        cape: "#06B6D4",
        capeDark: "#0E7490",
        capeHighlight: "#67E8F9",
        emblem: "#E0F2FE",
        emblemDark: "#7DD3FC",
        outline: "#082F49",
        accent: "#67E8F9",
        tether: "#67E8F9"
    },

    emerald: {
        primary: "#22C55E",
        primaryDark: "#15803D",
        secondary: "#14532D",
        secondaryDark: "#052E16",
        cape: "#16A34A",
        capeDark: "#166534",
        capeHighlight: "#86EFAC",
        emblem: "#FDE047",
        emblemDark: "#EAB308",
        outline: "#052E16",
        accent: "#86EFAC",
        tether: "#86EFAC"
    }
};

export function resolveTheme(theme = "classic") {
    const config = typeof theme === "string"
        ? { preset: theme }
        : theme;

    if (!config || typeof config !== "object") {
        throw new Error("SuperheroFX: Invalid theme configuration.");
    }

    const { preset = "classic", ...customColors } = config;

    if (!themes[preset]) {
        throw new Error(
            `SuperheroFX: Unknown theme "${preset}".`
        );
    }

    return {
        ...themes[preset],
        ...customColors
    };
}
