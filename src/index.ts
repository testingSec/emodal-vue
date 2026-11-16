import "./styles/emodal.scss";

export { default as EModal } from "./components/EModal.vue";
export { useEModal } from "./composables/useEModal";
export type {
  ModalContent,
  ModalContentOptions,
  OpenModalOptions,
} from "./composables/useEModal";
