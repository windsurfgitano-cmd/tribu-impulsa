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
                    500: '#FF8C00', // V2 Orange
                    600: '#E67E00',
                },
                // V2 Palette
                danger: { 50: '#FFF0F5', 500: '#FB275D' },
                success: { 50: '#E6FFF3', 500: '#00CA72' },
                accent: { 50: '#F3F3FF', 500: '#6161FF' },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
