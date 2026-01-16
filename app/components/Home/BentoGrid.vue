<template>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-6 max-w-7xl mx-auto">
    
    <!-- 1. Hero / Welcome (Span 2x2 on Desktop) -->
    <div class="md:col-span-2 lg:col-span-3 row-span-auto md:row-span-1 relative group transition-all duration-500 z-10">
        <slot name="hero" />
    </div>

    <!-- 2. Near Complete Widget (Tall on Desktop) -->
    <div class="md:col-span-1 lg:col-span-1 md:row-span-2 relative z-0">
        <slot name="near-complete" />
    </div>

    <!-- 3. Primary Action: Missing (Large) -->
    <div class="md:col-span-1 lg:col-span-1 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
        <slot name="action-missing" />
    </div>

    <!-- 4. Secondary Action: Limited -->
    <div class="md:col-span-1 lg:col-span-1 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
        <slot name="action-limited" />
    </div>

     <!-- 5. Map -->
    <div class="md:col-span-1 lg:col-span-1 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
        <slot name="action-map" />
    </div>

  </div>
</template>

<script setup lang="ts">
// BentoGrid is purely layout
</script>

<style scoped>
/* Bento Grid Animation Entry */
div {
    animation: fade-in-up 0.6s ease-out backwards;
}

div:nth-child(1) { animation-delay: 0.1s; }
div:nth-child(2) { animation-delay: 0.2s; }
div:nth-child(3) { animation-delay: 0.3s; }
div:nth-child(4) { animation-delay: 0.4s; }
div:nth-child(5) { animation-delay: 0.5s; }

@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
