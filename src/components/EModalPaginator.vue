<script setup lang="ts">
import EModalIcon from "./EModalIcon.vue";

defineProps<{
  canNext: boolean;
  canPrev: boolean;
  pageIndex: number;
}>();

const emit = defineEmits<{
  "next-page": [];
  "prev-page": [];
}>();
</script>

<template>
  <div class="e-paginator">
    <nav aria-label="Media pagination">
      <ul class="pagination justify-content-center align-items-center">
        <li class="page-item">
          <button
            type="button"
            class="page-link"
            :disabled="!canPrev"
            aria-label="Previous page"
            @click="emit('prev-page')"
          >
            <EModalIcon icon="chevron_left" />
          </button>
        </li>
        <slot name="pageActive">
          <li class="page-item active mx-3">
            <span class="page-link rounded">{{ pageIndex + 1 }}</span>
          </li>
        </slot>
        <li class="page-item">
          <button
            type="button"
            class="page-link"
            :disabled="!canNext"
            aria-label="Next page"
            @click="emit('next-page')"
          >
            <EModalIcon icon="chevron_right" />
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>
