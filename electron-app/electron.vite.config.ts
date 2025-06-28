import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()]
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            lib: {
                entry: 'src/preload/index.ts'
            }
        }
    },
    // renderer: {
    // plugins: [svelte()]
    // }
})
