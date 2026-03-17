/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        // font mặc định toàn app
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],

        // dùng cho heading
        heading: ['Raleway', 'sans-serif'],

        // dùng cho chữ fancy
        fancy: ['Dancing Script', 'cursive'],
      },
    },
  },
  plugins: [],
};