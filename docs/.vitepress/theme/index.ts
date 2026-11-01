import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Quiz from './components/Quiz.vue'
import YouTube from './components/YouTube.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Quiz', Quiz)
    app.component('YouTube', YouTube)
  }
} satisfies Theme
