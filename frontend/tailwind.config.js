var config = {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
            },
            colors: {
                brand: {
                    50: "#eef4ff",
                    100: "#dce8ff",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8"
                }
            },
            boxShadow: {
                soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
                panel: "0 8px 30px rgba(15, 23, 42, 0.07)"
            }
        }
    },
    plugins: []
};
export default config;
