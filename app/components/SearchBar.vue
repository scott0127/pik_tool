<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <span class="text-xl">🔍</span>
    </div>
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      class="input-field pl-12 pr-12"
    >
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="scale-0 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-0 opacity-0"
    >
      <button
        v-if="modelValue"
        @click="$emit('update:modelValue', '')"
        class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors"
      >
        <span class="w-6 h-6 bg-gray-100 hover:bg-emerald-100 rounded-full flex items-center justify-center text-sm">✕</span>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
