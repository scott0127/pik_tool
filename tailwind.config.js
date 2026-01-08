/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './app/**/*.{vue,js,ts}',
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './composables/**/*.{js,ts}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Noto Sans TC', 'sans-serif'],
            },
            colors: {
                // Pikmin type colors
                pikmin: {
                    red: '#E53E3E',
                    yellow: '#ECC94B',
                    blue: '#3182CE',
                    purple: '#805AD5',
                    white: '#E2E8F0',
                    rock: '#718096',
                    winged: '#ED64A6',
                },
                // App theme colors
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                leaf: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
            },
            animation: {
                'bounce-slow': 'bounce 2s infinite',
                'pulse-slow': 'pulse 3s infinite',
            },
        },
    },
    plugins: [],
}
