/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#1D4E89", // NIC Government Blue
                    dark: "#163C6A",
                    light: "#E2E8F0",
                },
                slate: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    900: '#0F172A',
                },
                status: {
                    bound: "#008000", // Standard Green
                    escalated: "#D32F2F", // Standard Red
                }
            },
            fontFamily: {
                sans: ['Noto Sans', 'Arial', 'sans-serif'],
                display: ['Noto Sans', 'Arial', 'sans-serif'],
            },
            borderRadius: {
                'none': '0',
                'sm': '2px',
                DEFAULT: '4px',
                'md': '4px',
                'lg': '4px',
                'xl': '4px',
                '2xl': '4px',
                '3xl': '4px',
                'full': '9999px',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }
        },
    },
    plugins: [],
}
