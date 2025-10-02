import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/stores/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors with CSS variables for theme switching
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Semantic color system for feng shui elements
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // Feng shui element colors
        elements: {
          wood: "hsl(120, 60%, 45%)",    // 木 - Green
          fire: "hsl(0, 70%, 55%)",      // 火 - Red
          earth: "hsl(45, 65%, 50%)",    // 土 - Yellow/Brown
          metal: "hsl(0, 0%, 75%)",      // 金 - Silver/White
          water: "hsl(220, 70%, 45%)",   // 水 - Blue
        },
        
        // Flying stars colors for visualization
        stars: {
          auspicious: "hsl(120, 50%, 60%)",
          neutral: "hsl(60, 30%, 70%)",
          inauspicious: "hsl(0, 50%, 60%)",
        }
      },
      
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        // Chinese fonts for better CJK support
        'zh': [
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"WenQuanYi Micro Hei"',
          'sans-serif',
        ],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        // 安全区域适配
        'safe': 'env(safe-area-inset-bottom)',
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Compass rotation animation
        "compass-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        // Flying stars animation
        "star-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        // 移动端滑动动画
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-down": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-left": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-right": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        // 渐入动画
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // 缩放动画
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "compass-spin": "compass-spin 2s linear infinite",
        "star-pulse": "star-pulse 2s ease-in-out infinite",
        // 移动端动画
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out", 
        "slide-left": "slide-left 0.3s ease-out",
        "slide-right": "slide-right 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      
      // 3D perspective for Three.js integration
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
      },

      // 响应式断点扩展
      screens: {
        'xs': '475px',
        // => @media (min-width: 475px) { ... }
        
        'sm': '640px',
        // => @media (min-width: 640px) { ... }

        'md': '768px',
        // => @media (min-width: 768px) { ... }

        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }

        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }

        // 高度相关的断点
        'h-sm': { 'raw': '(max-height: 640px)' },
        'h-md': { 'raw': '(max-height: 768px)' },
        'h-lg': { 'raw': '(max-height: 1024px)' },
        
        // 触摸设备
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
        'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
      },
    },
  },
  plugins: [
    // 添加自定义工具类插件
    function({ addUtilities }: any) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)'
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)'
        },
        '.safe-left': {
          'padding-left': 'env(safe-area-inset-left)'
        },
        '.safe-right': {
          'padding-right': 'env(safe-area-inset-right)'
        },
        '.pb-safe': {
          'padding-bottom': 'env(safe-area-inset-bottom)'
        }
      }
      
      addUtilities(newUtilities)
    }
    // Note: Install these plugins when needed:
    // npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/container-queries
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'), 
    // require('@tailwindcss/container-queries'),
  ],
};

export default config;