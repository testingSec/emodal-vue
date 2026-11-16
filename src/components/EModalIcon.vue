<script setup lang="ts">
withDefaults(
  defineProps<{
    ariaHidden?: boolean;
    border?: boolean;
    icon?: string;
    id?: string;
    outlined?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
  }>(),
  {
    ariaHidden: false,
    border: false,
    icon: "",
    outlined: false,
  }
);
</script>

<template>
  <span
    :id="id"
    class="e-icon"
    :class="{
      'e-icon-no-fill': outlined,
      'e-icon-border': border,
      [`e-icon-border-${size}`]: border && size,
    }"
    :aria-hidden="ariaHidden ? 'true' : undefined"
  >
    <svg
      v-if="icon === 'close'"
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
    <svg
      v-else-if="icon === 'minimize'"
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
    <svg
      v-else-if="icon === 'restore'"
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
    >
      <path d="M8 4h12v12H8zM4 8v12h12" />
    </svg>
    <svg
      v-else-if="icon === 'fullscreen'"
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
    >
      <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
    </svg>
    <svg
      v-else-if="icon === 'fullscreen_exit'"
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
    >
      <path d="M8 3v5H3m13-5v5h5M3 16h5v5m13-5h-5v5" />
    </svg>
    <svg
      v-else-if="icon === 'chevron_left'"
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
    <svg
      v-else-if="icon === 'chevron_right'"
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
    <span v-else class="material-symbols-rounded">{{ icon }}</span>
  </span>
</template>

<style>
.e-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.e-icon-no-fill .material-symbols-rounded {
  font-variation-settings: "FILL" 0;
}

.e-icon:not(.e-icon-no-fill) .material-symbols-rounded {
  font-variation-settings: "FILL" 1;
}

.e-icon svg {
  width: 1em;
  height: 1em;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.e-icon-border {
  width: 36px;
  height: 36px;
  overflow: hidden;
  border: 1px solid currentColor;
  border-radius: 50%;
}

.e-icon-border-sm {
  width: 30px;
  height: 30px;
}

.e-icon-border-lg {
  width: 58px;
  height: 58px;
}

.e-icon-border-xl {
  width: 88px;
  height: 88px;
}
</style>
