import { Modal } from "bootstrap";
import type { Directive } from "vue";

const clickHandlers = new WeakMap<HTMLElement, (event: MouseEvent) => void>();

const vModal: Directive<HTMLElement> = {
  mounted(element, binding) {
    const modifierId = Object.keys(binding.modifiers)[0];
    const id = binding.value ? String(binding.value) : modifierId;

    if (!id) return;

    const handleClick = (event: MouseEvent) => {
      if (element.tagName === "A" || element.tagName === "AREA") {
        event.preventDefault();
      }

      const target = document.getElementById(id);
      if (!target) return;

      Modal.getOrCreateInstance(target).toggle(element);
    };

    clickHandlers.set(element, handleClick);
    element.addEventListener("click", handleClick);
  },
  unmounted(element) {
    const handleClick = clickHandlers.get(element);
    if (!handleClick) return;

    element.removeEventListener("click", handleClick);
    clickHandlers.delete(element);
  },
};

export default vModal;
