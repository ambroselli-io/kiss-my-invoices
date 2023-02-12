module.exports = {
  content: ["./src/**/*.{html,js,tsx,jsx,ts}"],
  darkMode: "class", // https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually
  theme: {
    extend: {
      screen: {
        retina: "300dpi",
      },
      gridTemplateColumns: {
        invoices: "minmax(0, 3fr) minmax(0, 10fr) minmax(0, 7fr) repeat(4, minmax(0, 3fr))",
        invoice: "2rem minmax(0, 10fr) repeat(4, minmax(0, 4fr))",
      },
      colors: {
        app: "#03bfc6",
      },
      accent: {
        app: "#03bfc6",
      },
      borderColor: {
        DEFAULT: "#000",
      },
      aspectRatio: {
        link: "auto 480 / 250",
      },
      height: {
        "screen-4/5": "80vh",
        "screen-1/2": "50vh",
        18: "4.5rem",
        a4: "287mm",
      },
      width: {
        a4: "210mm",
      },
      minHeight: {
        "screen-1/2": "50vh",
      },
      minWidth: {
        xs: "20rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "3xl": "48rem",
        "4xl": "56rem",
        "5xl": "64rem",
      },
    },
  },
  variants: {},
  plugins: [
    require("@tailwindcss/line-clamp"),
    function ({ addVariant }) {
      addVariant("child", "& > *");
      addVariant("child-hover", "& > *:hover");
    },
  ],
};
