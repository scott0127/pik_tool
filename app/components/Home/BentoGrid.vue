<template>
  <div class="home-bento-grid grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 py-4 md:py-6 max-w-7xl mx-auto">
    
    <!-- 1. Hero / Welcome (Span 2x2 on Desktop) -->
    <div class="home-bento-cell md:col-span-2 lg:col-span-3 row-span-auto md:row-span-1 relative group transition-all duration-500 z-10">
        <slot name="hero" />
    </div>

    <!-- 2. Near Complete Widget (Tall on Desktop) -->
    <div class="home-bento-cell md:col-span-1 lg:col-span-1 md:row-span-2 relative z-0">
        <slot name="near-complete" />
    </div>

    <!-- 3. Primary Action: Missing (Large) -->
    <div v-if="$slots['action-missing']" class="home-bento-cell md:col-span-1 lg:col-span-1 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
        <slot name="action-missing" />
    </div>

    <!-- 4. Secondary Action: Limited -->
    <div v-if="$slots['action-limited']" class="home-bento-cell md:col-span-1 lg:col-span-1 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
        <slot name="action-limited" />
    </div>

     <!-- 5. Map -->
    <div v-if="$slots['action-map']" class="home-bento-cell md:col-span-1 lg:col-span-1 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
        <slot name="action-map" />
    </div>

  </div>
</template>

<script setup lang="ts">
// BentoGrid is purely layout
</script>

<style scoped>
@media (max-width: 767px) {
    .home-bento-grid {
        width: min(100%, 43rem);
        padding-inline: 1.5rem;
        gap: 1.35rem;
    }

    .home-bento-cell {
        width: min(100%, 34rem);
        margin-inline: auto;
    }
}
</style>
