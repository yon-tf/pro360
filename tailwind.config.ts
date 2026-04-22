import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tokens from "./design-system/tokens.json";

function hslVar(name: string) {
	return `hsl(var(${name}) / <alpha-value>)`;
}

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
					'var(--font-sans)',
					'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'ui-monospace',
  				'monospace'
  			]
  		},
  		borderRadius: {
  			xl: 'var(--radius)',
  			lg: 'calc(var(--radius) - 2px)',
  			md: 'calc(var(--radius) - 4px)',
  			sm: 'calc(var(--radius) - 6px)'
  		},
			fontSize: {
				...(tokens.typography?.size ?? {}),
			},
			letterSpacing: {
				...(tokens.typography?.tracking ?? {}),
			},
  		colors: {
  			brand: 'var(--brand-hex)',
  			background: hslVar("--background"),
  			foreground: hslVar("--foreground"),
  			card: {
  				DEFAULT: hslVar("--card"),
  				foreground: hslVar("--card-foreground")
  			},
  			popover: {
  				DEFAULT: hslVar("--popover"),
  				foreground: hslVar("--popover-foreground")
  			},
  			primary: {
  				DEFAULT: hslVar("--primary"),
  				foreground: hslVar("--primary-foreground")
  			},
  			secondary: {
  				DEFAULT: hslVar("--secondary"),
  				foreground: hslVar("--secondary-foreground")
  			},
  			muted: {
  				DEFAULT: hslVar("--muted"),
  				foreground: hslVar("--muted-foreground")
  			},
  			accent: {
  				DEFAULT: hslVar("--accent"),
  				foreground: hslVar("--accent-foreground")
  			},
  			destructive: {
  				DEFAULT: hslVar("--destructive"),
  				foreground: hslVar("--destructive-foreground")
  			},
  			border: hslVar("--border"),
  			input: hslVar("--input"),
  			ring: hslVar("--ring"),
  			sidebar: hslVar("--sidebar"),
  			success: hslVar("--success"),
  			warning: hslVar("--warning"),
  			chart: {
  				'1': hslVar("--chart-1"),
  				'2': hslVar("--chart-2"),
  				'3': hslVar("--chart-3"),
  				'4': hslVar("--chart-4"),
  				'5': hslVar("--chart-5")
  			}
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
