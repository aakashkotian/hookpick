import type { Config } from 'tailwindcss'
export default { content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'], theme:{ extend: { colors:{ brand:{600:'#3b4dd1'} } } }, plugins:[] } satisfies Config
