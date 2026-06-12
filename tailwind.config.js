/** @type {import('tailwindcss').Config} */
const pikminGreen = {
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
    950: '#022c22',
};

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
                sans: ['Nunito', 'Noto Sans TC', 'sans-serif'],
            },
            colors: {
                // Pikmin type colors
                pikmin: {
                    red: '#E53E3E',
                    yellow: '#ECC94B',
                    blue: '#3182CE',
                    purple: '#805AD5',
                    white: '#F7FAFC',
                    rock: '#718096',
                    winged: '#ED64A6',
                    ice: '#0BC5EA',
                },
                // App theme colors
                primary: pikminGreen,
                leaf: pikminGreen,
            },
            animation: {
                'bounce-slow': 'bounce 2s infinite',
                'pulse-slow': 'pulse 3s infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(0, 185, 47, 0.3)',
                'glow-lg': '0 0 40px rgba(0, 185, 47, 0.4)',
            },
            borderRadius: {
                '4xl': '2rem',
            },
        },
    },
    plugins: [],
}
