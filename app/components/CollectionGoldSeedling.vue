<template>
  <span class="gold-seedling-illustration" aria-hidden="true">
    <span class="gold-seedling-shadow" />
    <Icon name="lucide:sprout" class="gold-seedling-sprout" />
    <span class="gold-seedling-bag">
      <span class="gold-seedling-seam" />
      <span class="gold-seedling-label"><Icon name="lucide:sprout" /></span>
      <span class="gold-seedling-glint" />
    </span>
    <span class="gold-seedling-rim" />
  </span>
</template>

<style scoped>
.gold-seedling-illustration { display: block; position: relative; width: 76px; height: 76px; flex: 0 0 auto; pointer-events: none; }
.gold-seedling-illustration > span, .gold-seedling-bag > span { position: absolute; display: block; }
.gold-seedling-shadow { left: 12%; right: 12%; bottom: 3%; height: 13%; background: radial-gradient(ellipse, #81601a25, transparent 70%); }
.gold-seedling-sprout { position: absolute; z-index: 2; width: 40%; height: 40%; left: 30%; top: 0; color: #429966; }
.gold-seedling-bag { left: 17%; right: 17%; top: 34%; bottom: 9%; overflow: hidden; border: 1px solid #c39a42; border-radius: 22% 22% 29% 29%; background: linear-gradient(110deg, #e2b45b, #ffe9a0 43%, #edc46f 72%, #d6a348); box-shadow: inset 2px 0 3px #ffffff60, inset -2px -2px 4px #9b741422, 0 3px 4px #73561d15; }
.gold-seedling-seam { left: 10%; right: 10%; bottom: 9%; height: 1px; background: #cba65270; }
.gold-seedling-label { display: grid !important; place-items: center; inset: 20% 24%; border: 1px solid #d4b165; border-radius: 7px; background: #fff5ca; color: #8c732f; transform: rotate(-5deg); }
.gold-seedling-label .iconify { width: 72%; height: 72%; }
.gold-seedling-rim { left: 19%; right: 19%; top: 30%; height: 10%; z-index: 3; border: 1px solid #c39a42; border-radius: 3px 3px 5px 5px; background: linear-gradient(#f9df93, #e0b256); box-shadow: 0 2px 1px #aa842824, inset 0 1px 0 #fff1b8; }
.gold-seedling-glint { inset: -15% 0; width: 35%; background: linear-gradient(90deg, transparent, #fffce9b3, transparent); transform: translateX(-160%) skewX(-18deg); opacity: 0; }
</style>
