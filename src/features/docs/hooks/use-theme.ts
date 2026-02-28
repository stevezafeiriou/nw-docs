import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "nw-docs:theme";

function getPreferredTheme(): Theme {
	if (typeof window === "undefined") {
		return "light";
	}

	const storedTheme = window.localStorage.getItem(STORAGE_KEY);
	if (storedTheme === "light" || storedTheme === "dark") {
		return storedTheme;
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(getPreferredTheme);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		window.localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	return {
		theme,
		toggleTheme() {
			setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
		},
	};
}
