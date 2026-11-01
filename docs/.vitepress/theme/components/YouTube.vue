<script setup lang="ts">
// Usage in Markdown: <YouTube id="影片ID" title="影片標題" />
defineProps<{ id: string; title?: string }>()
</script>

<template>
  <figure class="yt">
    <div class="yt-frame">
      <iframe
        :src="`https://www.youtube-nocookie.com/embed/${id}`"
        :title="title ?? 'YouTube 影片'"
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
    <figcaption v-if="title">🎬 {{ title }}</figcaption>
  </figure>
</template>

<style scoped>
.yt { margin: 24px 0; }
.yt-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}
.yt-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
figcaption { margin-top: 8px; font-size: 14px; color: var(--vp-c-text-2); text-align: center; }
</style>
