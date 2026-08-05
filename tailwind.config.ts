/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  important: true,
  theme: {
      screens: {
          xs: "540px",
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
          lg_992: '992px',
      },
      
      container: {
          center: true,
          padding: {
              DEFAULT: '1rem',
              sm: '1.25rem',
              md: '1.5rem',
              lg: '2rem',
              xl: '2.5rem',
              '2xl': '3rem',
          },
          screens: {
              sm: '640px',
              md: '768px',
              lg: '1024px',
              xl: '1200px',
              '2xl': '1360px',
          },
      },
      extend: {
        colors: {
            primary: {
                DEFAULT: '#0088D8',
                50: '#effaff',
                100: '#def4ff',
                200: '#b6eaff',
                300: '#79d9ff',
                400: '#34c0ff',
                500: '#0088D8',
                600: '#006fb6',
                700: '#005b94',
                800: '#004c7a',
                900: '#003f65',
                950: '#002844',
            },
            navy: {
                DEFAULT: '#081b45',
                50: '#eef3ff',
                100: '#dbe6ff',
                200: '#bfd1ff',
                300: '#93b3ff',
                400: '#5f86ff',
                500: '#355bff',
                600: '#1936ff',
                700: '#1328d6',
                800: '#1426ad',
                900: '#081b45',
                950: '#040d24',
            },
            accent: {
                DEFAULT: 'rgb(249 73 16)',
                50: '#fff1ec',
                100: '#ffe4d9',
                200: '#ffc8b3',
                300: '#ffa080',
                400: '#ff704d',
                500: 'rgb(249 73 16)',
                600: '#e03e0e',
                700: '#b83009',
                800: '#96280b',
                900: '#7d240e',
                950: '#451006',
            },
            red: {
                DEFAULT: 'rgb(249 73 16)',
                50: '#fff1ec',
                100: '#ffe4d9',
                200: '#ffc8b3',
                300: '#ffa080',
                400: '#ff704d',
                500: 'rgb(249 73 16)',
                600: '#e03e0e',
                700: '#b83009',
                800: '#96280b',
                900: '#7d240e',
                950: '#451006',
            },
        },
            fontFamily: {
                manrope: ['var(--font-manrope)'],
          },
          boxShadow: {
              sm: '0 2px 4px 0 rgb(60 72 88 / 0.15)',
              DEFAULT: '0 0 3px rgb(60 72 88 / 0.15)',
              md: '0 5px 13px rgb(60 72 88 / 0.20)',
              lg: '0 10px 25px -3px rgb(60 72 88 / 0.15)',
              xl: '0 20px 25px -5px rgb(60 72 88 / 0.1), 0 8px 10px -6px rgb(60 72 88 / 0.1)',
              '2xl': '0 25px 50px -12px rgb(60 72 88 / 0.25)',
              inner: 'inset 0 2px 4px 0 rgb(60 72 88 / 0.05)',
              testi: '2px 2px 2px -1px rgb(60 72 88 / 0.15)',
          },

          fontSize: {
              xs: ['11px', '16px'],
              sm: ['12px', '18px'],
              caption: ['13px', '20px'],
              base: ['15px', '24px'],
              lg: ['17px', '26px'],
              xl: ['20px', '28px'],
              '2xl': ['26px', '32px'],
              '3xl': ['32px', '38px'],
              '4xl': ['40px', '46px'],
              '5xl': ['48px', '56px'],
          },

          spacing: {
              0.75: '0.1875rem',
              3.25: '0.8125rem',
              'section': '5rem',
              'section-lg': '6rem',
          },

          maxWidth: ({
                        }) => ({
              '1200': '71.25rem',
              '992': '60rem',
              '768': '45rem',
          }),

          zIndex: {
              1: '1',
              2: '2',
              3: '3',
              999: '999',
          },
      },
  },

  plugins: [
      require("@tailwindcss/forms")({
        strategy: 'class', // only generate classes
      }),
  ],
}

