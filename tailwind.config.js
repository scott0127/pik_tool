/** @type {import('tailwindcss').Config} */
const pikminGreen = {
    50: '#edfff2',
    100: '#d6ffe0',
    200: '#adffc1',
    300: '#73ff96',
    400: '#2bea5d',
    500: '#00b92f',
    600: '#00a129',
    700: '#008523',
    800: '#06691f',
    900: '#07551d',
    950: '#003910',
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
                // App theme colors: match the bright Pikmin logo green.
                primary: pikminGreen,
                leaf: pikminGreen,
                emerald: pikminGreen,
                green: pikminGreen,
                teal: pikminGreen,
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
