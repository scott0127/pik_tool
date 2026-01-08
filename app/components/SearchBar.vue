<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      class="w-full pl-10 pr-10 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm placeholder-gray-400"
    >
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
    </button>
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
