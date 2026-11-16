<template>
  <!-- Teleport mueve el subárbol activo entre body y el dock sin recrear la instancia del modal. -->
  <teleport :to="teleportTarget">
    <div
      :id="computedId"
      ref="element"
      class="modal e-modal"
      :class="modalClasses"
      tabindex="-1"
    >
      <div
        ref="dialogRef"
        class="modal-dialog"
        :class="[
          modalDialogClasses,
          {
            'e-modal--movable': isMovable,
            'e-modal--dragging': isDragging,
            'e-modal--resizable': isResizable,
          },
        ]"
      >
        <div
          :id="`${computedId}_content`"
          class="modal-content"
          :class="[contentClass, {'e-modal--multimedia' : multimedia}]"
        >
          <!-- El modo multimedia muestra la imagen o el video actual fuera del slot del cuerpo. -->
          <template v-if="multimedia">
            <button
              action="tertiary"
              :id="`${computedId}_btnMediaClose`"
              type="button"
              class="e-modal-media__close"
              :class="computedCloseButtonClasses"
              :aria-label="headerCloseLabel"
              @click="handleCancel"
             >
              <e-icon icon="close" />
            </button>
            <div class="e-modal-media w-100">
              <img v-if="isImage"
                :src="currentPage.media"
                :alt="currentPage.title || title || 'Modal'"
              />
              <video v-else-if="isVideo" controls>
                <source :src="currentPage.media" />
                <track
                  v-if="currentPage.subtitles"
                  :src="currentPage.subtitles"
                  kind="subtitles"
                  srclang="es"
                  label="Español"
                />
              </video>
            </div>
          </template>
          <!-- El encabezado reúne slots de título/icono y controles de ventana. -->
          <div
            v-if="!hideHeader"
            :id="`${computedId}_header`"
            class="modal-header"
            :class="computedHeaderClasses"
            @pointerdown="startDrag"
            @pointermove="moveDrag"
            @pointerup="stopDrag"
            @pointercancel="stopDrag"
            @lostpointercapture="stopDrag"
            @dblclick="handleHeaderDoubleClick"
          >
            <component
              :id="`${computedId}_title`"
              :is="safeTitleTag"
              class="modal-title fw-bold"
              :class="computedTitleClasses"
            >
              <slot name="title">
                <slot name="icon">
                  <e-icon
                    v-if="icon"
                    :id="computedId + '_icon'"
                    class="e-modal-icon my-2"
                    :icon="icon"
                    :outlined="iconOutlined"
                    :border="iconBorder"
                  />
                </slot>
                {{ currentPage.title || title }}
              </slot>
            </component>

            <button
              v-if="canMinimize"
              type="button"
              class="e-modal__minimize"
              :class="{
                'e-modal__minimize--with-close': !hideHeaderClose || multimedia,
                'e-modal__minimize--with-maximize': showMaximizeButton && !isMinimized,
              }"
              :aria-label="isMinimized ? 'Restaurar ventana' : 'Minimizar ventana'"
              :title="isMinimized ? 'Restaurar ventana' : 'Minimizar ventana'"
              @click="handleMinimize"
            >
              <e-icon :icon="isMinimized ? 'restore' : 'minimize'" />
            </button>
            <button
              v-if="showMaximizeButton && !isMinimized"
              :id="`${computedId}_btnMaximize`"
              type="button"
              class="e-modal__maximize"
              :class="{
                'e-modal__maximize--with-close': !hideHeaderClose || multimedia,
              }"
              action="tertiary"
              :aria-label="isFullscreen ? 'Restaurar ventana' : 'Maximizar ventana'"
              :title="isFullscreen ? 'Restaurar' : 'Maximizar'"
              @click="toggleMaximize"
            >
              <e-icon :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'" />
            </button>
            <button
              v-if="!hideHeaderClose && !multimedia"
              :id="`${computedId}_btnClose`"
              type="button"
              class="e-modal__close"
              action="tertiary"
              :class="computedCloseButtonClasses"
              :aria-label="headerCloseLabel"
              @click="handleCancel"
            >
              <e-icon icon="close" />
              <slot name="header-close"></slot>
            </button>
            <button
              v-if="isMinimized && (hideHeaderClose || multimedia)"
              :id="`${computedId}_btnMinimizedClose`"
              type="button"
              class="e-modal__minimized-close"
              :aria-label="headerCloseLabel"
              :title="headerCloseLabel"
              @click="handleCancel"
            >
              <e-icon icon="close" />
            </button>
          </div>
          <hr v-if="!hideHrHeader && !multimedia" class="m-0 mx-3"/>
          <div
            ref="modalBodyRef"
            :id="`${computedId}_body`"
            class="modal-body fs-6"
            :class="[computedBodyClasses, 'e-scroll', { sm: isTablet }]"
          >
            <!-- El slot por defecto reemplaza el contenido; si está vacío se usa content de mediaSrc. -->
            <slot>
              {{ currentPage.content || '' }}
            </slot>
          </div>
          <e-paginator
            v-if="isSlider"
            @next-page="nextPage"
            @prev-page="prevPage"
            :pageIndex="pageIndex"
            :canPrev="Array.isArray(mediaSrc) ? pageIndex > 0 : false"
            :canNext="Array.isArray(mediaSrc) ? pageIndex < mediaSrc.length - 1 : false"
            class="e-modal__paginator"
          >
            <template #pageActive>
              <li class="mx-3">
                <span class="text-nowrap">
                  {{ pageIndex + 1 }} de {{ Array.isArray(mediaSrc) ? mediaSrc.length : 1 }}
                </span>
              </li>
            </template>
          </e-paginator>
          <hr v-if="!hideHrFooter && !multimedia" class="m-0 mx-3"/>
          <div
            v-if="!hideFooter"
            :id="`${computedId}_footer`"
            class="modal-footer"
            :class="computedFooterClasses"
          >
            <!-- El slot footer reemplaza también el grupo predeterminado Aceptar/Cancelar. -->
            <slot name="footer">
              <div class="e-modal__btn-group m-0">
                <button
                  v-if="!okOnly"
                  :id="`${computedId}_btnCancel`"
                  type="button"
                  class="btn"
                  :class="[`btn-${cancelVariant}`, `btn-${buttonSize}`]"
                  data-bs-dismiss="modal"
                  :disabled="disableCancel"
                  tabindex="0"
                  @click="handleFooterCancel"
                >
                    {{ cancelTitle }}
                </button>
                <button
                  :id="`${computedId}_btnOK`"
                  type="button"
                  class="btn"
                  :disabled="disableOk"
                  :class="[`btn-${okVariant}`, `btn-${buttonSize}`]"
                  tabindex="0"
                  @click="handleOk"
                >
                  {{ okTitle }}
                </button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
/**
 * Diálogo reutilizable basado en Vue y Bootstrap, con visibilidad controlable
 * mediante v-model o la propiedad legacy `show`, y eventos para sus acciones
 * y ciclo de vida.
 *
 * Incluye presentación multimedia, navegación entre elementos, movimiento,
 * redimensionamiento y modos de pantalla completa y minimizado. También
 * coordina el apilamiento, los backdrops y el scroll cuando hay modales en
 * cascada. Al minimizar, conserva la instancia y el contenido montados.
 */
// 1. IMPORTS
import {
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  useSlots,
  watch,
  nextTick,
  useId as useVueId,
} from "vue";
import type { PropType } from "vue";
import { Modal } from "bootstrap";
import EPaginator from "./EModalPaginator.vue";
import { onClickOutside, useEventListener, useMediaQuery } from "@vueuse/core";
import EIcon from "./EModalIcon.vue";

defineOptions({ name: "EModal" });

type ColorVariant = string;
type InputSize = "sm" | "md" | "lg";

type ModalLifecycleState =
  | "hidden"
  | "showing"
  | "shown"
  | "hiding";

/** Límites horizontales o verticales disponibles para mover el diálogo. */
type DragBounds = {
  min: number;
  max: number;
};

/** Datos del puntero y geometría inicial de una operación de arrastre. */
type ModalDragState = {
  pointerId: number;
  captureElement: HTMLElement;
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
  minDeltaX: number;
  maxDeltaX: number;
  minDeltaY: number;
  maxDeltaY: number;
};

/** Valores inline del diálogo que deben conservarse al maximizar o minimizar. */
type ModalGeometryState = {
  position: string;
  margin: string;
  left: string;
  top: string;
  width: string;
  height: string;
  minWidth: string;
  minHeight: string;
  maxWidth: string;
  maxHeight: string;
};

/** Opciones de Bootstrap que determinan si la instancia puede minimizarse. */
type MinimizeInitialization = {
  hideBackdrop: boolean;
  noFocus: boolean;
  noCloseOnBackdrop: boolean;
};

type ModalMediaPage = { media: string; title?: string; content?: string; subtitles?: string };
type ModalMediaSource = string | ModalMediaPage | ModalMediaPage[];

type PendingBackdropAssociation = {
  modal: HTMLElement;
  existingBackdrops: Set<HTMLElement>;
  event: Event;
};

const modalBackdrops = new WeakMap<HTMLElement, HTMLElement>();
const backdropOwners = new WeakMap<HTMLElement, HTMLElement>();
const pendingBackdropAssociations: PendingBackdropAssociation[] = [];
let backdropAssociationScheduled = false;

/** Relaciona el backdrop nuevo con la instancia que lo está abriendo. */
function queueBackdropAssociation(
  modal: HTMLElement,
  event: Event,
  existingBackdrops: Set<HTMLElement>
) {
  pendingBackdropAssociations.push({ modal, event, existingBackdrops });
  if (backdropAssociationScheduled) return;

  backdropAssociationScheduled = true;
  void Promise.resolve().then(() => {
    backdropAssociationScheduled = false;
    const pending = pendingBackdropAssociations.splice(0);
    const backdrops = Array.from(
      document.querySelectorAll<HTMLElement>(".modal-backdrop")
    );

    pending.forEach(({
      modal: owner,
      event: showEvent,
      existingBackdrops: existing,
    }) => {
      if (showEvent.defaultPrevented || !owner.isConnected) return;

      const backdrop = backdrops.find(
        (candidate) => !existing.has(candidate) && !backdropOwners.has(candidate)
      );
      if (!backdrop) return;

      modalBackdrops.set(owner, backdrop);
      backdropOwners.set(backdrop, owner);
    });
  });
}

function getModalBackdrop(modal: HTMLElement): HTMLElement | undefined {
  const backdrop = modalBackdrops.get(modal);
  return backdrop?.isConnected ? backdrop : undefined;
}

function forgetModalBackdrop(modal: HTMLElement) {
  const backdrop = modalBackdrops.get(modal);
  if (backdrop) {
    backdropOwners.delete(backdrop);
    modalBackdrops.delete(modal);
  }
}

// 2. PROPS & EMITS
const props = defineProps({
  aspectRatio: { type: String, default: "auto" },                     // Relación de aspecto CSS del contenedor multimedia.
  bodyBgVariant: { type: String as PropType<ColorVariant> },          // Variante de color Bootstrap para el fondo del cuerpo.
  bodyClass: { type: String },                                        // Clases adicionales para el cuerpo.
  bodyTextVariant: { type: String as PropType<ColorVariant> },        // Variante de color Bootstrap para el texto del cuerpo.
  busy: { type: Boolean, default: false },                            // Deshabilita las acciones Aceptar y Cancelar mientras se procesa.
  buttonSize: { type: String as PropType<InputSize>, default: "md" }, // Tamaño de los botones del pie.
  cancelDisabled: { type: Boolean, default: false },                  // Deshabilita el botón Cancelar.
  cancelTitle: { type: String, default: "Cancelar" },                 // Texto del botón Cancelar.
  cancelVariant: {
    type: String as PropType<ColorVariant>, default: "outline-primary",
  },                                                                  // Variante visual del botón Cancelar.
  centered: { type: Boolean, default: true },                         // Centra verticalmente el diálogo.
  contentClass: { type: String },                                     // Clases adicionales para .modal-content.
  dialogClass: { type: String },                                      // Clases adicionales para .modal-dialog.
  mediaBodyHeight: {
    type: [Number, String, Boolean] as PropType<number | string | boolean>,
    default: undefined,
  },                                                                  // false/undefined: auto; number: px; string: CSS; true: altura común para páginas multimedia.
  footerBgVariant: { type: String as PropType<ColorVariant> },        // Variante de fondo del pie.
  footerBorderVariant: { type: String as PropType<ColorVariant> },    // Variante del borde del pie.
  footerClass: { type: String },                                      // Clases adicionales para el pie.
  footerTextVariant: { type: String as PropType<ColorVariant> },      // Variante del texto del pie.
  fullscreen: { type: [Boolean, String], default: false },            // Estado inicial o breakpoint responsive de pantalla completa.
  headerBgVariant: { type: String as PropType<ColorVariant> },        // Variante de fondo del encabezado.
  headerBorderVariant: { type: String as PropType<ColorVariant> },    // Variante del borde del encabezado.
  headerClass: { type: String },                                      // Clases adicionales para el encabezado.
  headerCloseLabel: { type: String, default: "Close" },               // Etiqueta accesible de los botones para cerrar.
  headerCloseWhite: { type: Boolean, default: false },                // Usa el icono de cierre blanco.
  headerTextVariant: { type: String as PropType<ColorVariant> },      // Variante del texto del encabezado.
  hideBackdrop: { type: Boolean, default: false },                    // Desactiva el backdrop de Bootstrap.
  hideFooter: { type: Boolean, default: false },                      // Oculta el pie.
  hideHrFooter: { type: Boolean, default: false },                    // Oculta el separador previo al pie.
  hideHeader: { type: Boolean, default: false },                      // Oculta el encabezado y sus acciones.
  hideHrHeader: { type: Boolean, default: false },                    // Oculta el separador posterior al encabezado.
  hideHeaderClose: { type: Boolean, default: false },                 // Oculta el botón de cierre del encabezado.
  icon: { type: String },                                             // Icono opcional junto al título.
  iconOutlined: { type: Boolean, default: false },                    // Muestra el icono en estilo delineado.
  iconBorder: { type: Boolean, default: false },                      // Añade borde al icono.
  id: { type: String },                                               // Identificador base; se generan IDs relacionados a partir de este valor.
  mediaSrc: { type: [String, Object, Array] as PropType<ModalMediaSource>, default: '' }, // URL, elemento multimedia o lista de páginas con título, contenido y subtítulos.
  modalClass: { type: String },                                       // Clases adicionales para el elemento raíz del modal.
  modelValue: { type: Boolean, default: false },                      // Estado controlado mediante v-model.
  multimedia: { type: Boolean, default: false },                      // Activa la presentación de mediaSrc como contenido multimedia.
  movable: { type: Boolean, default: false },                         // Permite arrastrar el diálogo desde el encabezado.
  maximizable: { type: Boolean, default: false },                     // Muestra el control para alternar pantalla completa.
  noMinimizable: { type: Boolean, default: false },                   // Oculta la acción de minimizar aunque se cumplan sus requisitos.
  resizable: { type: Boolean, default: false },                       // Habilita el redimensionamiento del diálogo mediante estilos.
  noCloseOnBackdrop: { type: Boolean, default: false },               // Hace estático el backdrop: un clic fuera no cierra el modal.
  noCloseOnEsc: { type: Boolean, default: false },                    // Impide cerrar el modal con Escape.
  noFade: { type: Boolean, default: false },                          // Desactiva las transiciones de Bootstrap.
  noFocus: { type: Boolean, default: false },                         // Desactiva el focus trap de Bootstrap.
  okDisabled: { type: Boolean, default: false },                      // Deshabilita el botón Aceptar.
  okOnly: { type: Boolean, default: false },                          // Muestra Aceptar y oculta Cancelar en el pie predeterminado.
  okTitle: { type: String, default: "Aceptar" },                      // Texto del botón Aceptar.
  okVariant: { type: String as PropType<ColorVariant>, default: "primary" }, // Variante visual del botón Aceptar.
  scrollable: { type: Boolean, default: false },                      // Permite desplazar el contenido interno del modal.
  allowPageScroll: { type: Boolean, default: false },                 // Solicita scroll global según la regla del stack; fullscreen lo bloquea.
  show: { type: Boolean, default: false },                            // API legacy alternativa a v-model; evita combinar ambas fuentes de estado.
  size: { type: String },                                             // Tamaño Bootstrap del diálogo, por ejemplo sm, lg o xl.
  slider: { type: Boolean, default: false },                          // Añade navegación cuando mediaSrc contiene varias páginas.
  title: { type: String },                                            // Título predeterminado y fallback para páginas multimedia.
  titleClass: { type: String },                                       // Clases adicionales para el título.
  titleSrOnly: { type: Boolean, default: false },                     // Oculta visualmente el título sin quitarlo del árbol accesible.
  titleTag: { type: String, default: "h5" },                          // Etiqueta de título permitida: h1-h6, div o span.
});

// Eventos de ciclo de vida reflejan Bootstrap; ok/cancel y click-outside representan acciones del componente.
const emit = defineEmits([
  "update:modelValue",
  "show",
  "shown",
  "hide",
  "hidden",
  "hide-prevented",
  "ok",
  "cancel",
  "click-outside"
]);

// 3. ESTADO REACTIVO Y REFS
// IDs, capacidades del dispositivo y slots usados por las computadas del componente.
const generatedId = useVueId();
const computedId = props.id ?? `e-modal-${generatedId}`;
const isTablet = useMediaQuery("(max-width: 768px)");
const slots = useSlots();
const safeTitleTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "div", "span"]);

// Referencias al nodo raíz, a la instancia Bootstrap y a las zonas que requieren medición.
const element = ref<HTMLElement>();
const instance = ref<Modal>();
const modalBodyRef = ref<HTMLElement | null>(null);
const dialogRef = ref<HTMLElement | null>(null);

// Estado de interacción, geometría, paginación y ciclo de vida visual.
const isDragging = ref(false);
const dragState = ref<ModalDragState | null>(null);
const stopOutside = ref<(() => void) | undefined>();
const pageIndex = ref(0);
const fullscreenState = ref<boolean | string>(props.fullscreen); // Estado responsive que también cambia desde el botón.
const savedGeometry = ref<ModalGeometryState | null>(null); // Geometría previa a maximizar.
const minimizedGeometry = ref<ModalGeometryState | null>(null); // Geometría previa a minimizar, independiente de fullscreen.
const isBootstrapShown = ref(false); // Espejo Vue de la clase .show administrada por Bootstrap.
const isMinimized = ref(false); // Cambia solo la presentación; el modal sigue abierto y montado.
const minimizedDock = ref<HTMLElement | null>(null); // Dock compartido que contiene las ventanas minimizadas.
const minimizeInitialization = ref<MinimizeInitialization | null>(null); // Snapshot de opciones Bootstrap al montar.

// Coordinación de tareas globales asociadas a esta instancia.
let backdropObserver: MutationObserver | null = null;
let mediaHeightTimeout: ReturnType<typeof setTimeout> | undefined;
let isComponentUnmounted = false;
let isComponentUnmounting = false;
let shouldHandoffBackdrop = false;
// Estado temporal para sincronizar las opacidades al cerrar un nivel de una cascada.
let closingBackdropHandoff: {
  outgoing: HTMLElement;
  incoming: HTMLElement;
  incomingOpacity: string;
  incomingTransition: string;
  incomingZIndex: string;
  outgoingOpacity: string;
  outgoingTransition: string;
  outgoingZIndex: string;
  outgoingStartOpacity: number;
  duration: number;
  startTime: number;
  targetOpacity: number;
  frame: number | null;
} | null = null;
let lifecycleState: ModalLifecycleState = "hidden";
let shouldRestoreFocusAfterHide = false;
let disposeOnUnmount: (() => void) | null = null;

// 4. COMPUTADAS
/** Evita resolver como elementos o componentes arbitrarios los valores de titleTag. */
const safeTitleTag = computed(() =>
  safeTitleTags.has(props.titleTag) ? props.titleTag : "h5"
);

/** Determina el tipo de media por MIME data URL o extensión; las URLs desconocidas son imágenes por compatibilidad. */
const mediaType = computed(() => {
  const media = currentPage.value?.media;

  if (!media) return "";

  if (/^data:image\//i.test(media)) return "image";
  if (/^data:video\//i.test(media)) return "video";

  const source = media.split(/[?#]/)[0].toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/.test(source)) {
    return "image";
  }

  if (/\.(mp4|webm|ogv|mov|m4v)$/.test(source)) {
    return "video";
  }

  // Preserve the historical behavior for media URLs without a recognized type.
  return "image";
});

/** Flags de presentación derivados del tipo multimedia actual. */
const isImage = computed(() => mediaType.value === "image");
const isVideo = computed(() => mediaType.value === "video");

/** Activa la paginación solo si hay más de una página multimedia. */
const isSlider = computed(() => {
  return props.slider &&
    Array.isArray(props.mediaSrc) &&
    props.mediaSrc.length > 1;
});

/** Normaliza las variantes admitidas de mediaSrc a una página con media, título y contenido. */
const currentPage = computed(() => {
  if (Array.isArray(props.mediaSrc)) {
    return props.mediaSrc[pageIndex.value] || props.mediaSrc[0] || {
      media: '',
      title: props.title,
      content: ''
    };
  }

  if (typeof props.mediaSrc === 'object' && props.mediaSrc !== null) {
    return props.mediaSrc;
  }

  return {
    media: props.mediaSrc,
    title: props.title,
    content: ''
  };
});

/** El valor responsive de fullscreen también se considera activo. */
const isFullscreen = computed(() => Boolean(fullscreenState.value));

/** El scroll de página queda permitido si se solicitó y la instancia no está maximizada. */
const canScrollPage = computed(
  () => props.allowPageScroll && (!isFullscreen.value || isMinimized.value)
);

/** Minimizar solo es seguro si la instancia se creó sin backdrop ni focus trap y permite scroll exterior. */
const canMinimize = computed(() => {
  const initialization = minimizeInitialization.value;

  return Boolean(
    !props.noMinimizable &&
    !props.hideHeader &&
    props.allowPageScroll &&
    initialization?.hideBackdrop &&
    initialization.noFocus &&
    initialization.noCloseOnBackdrop
  );
});

/** Teletransporta el mismo nodo al dock mientras está minimizado; no desmonta el contenido. */
const teleportTarget = computed(() =>
  isMinimized.value && minimizedDock.value
    ? minimizedDock.value
    : "body"
);

/** El botón de maximizar solo se ofrece para fullscreen booleano, no para breakpoints responsive. */
const showMaximizeButton = computed(() =>
  props.maximizable &&
  !props.hideHeader &&
  typeof props.fullscreen === "boolean"
);

/** Capacidades visuales limitadas por fullscreen y por la presencia del encabezado. */
const isMovable = computed(() =>
  props.movable && !isFullscreen.value && !props.hideHeader
);

const isResizable = computed(() =>
  props.resizable && !isFullscreen.value
);

/** Clases del nodo Bootstrap raíz, incluido el estado gestionado por el ciclo de vida. */
const modalClasses = computed(() => [
  {
    fade: !props.noFade,
    show: isBootstrapShown.value,
    "e-modal--minimized": isMinimized.value,
    "e-modal--fullscreen": fullscreenState.value === true,
    "e-modal--fullscreen-sm-down": fullscreenState.value === "sm",
    "e-modal--fullscreen-md-down": fullscreenState.value === "md",
    "e-modal--fullscreen-lg-down": fullscreenState.value === "lg",
    "e-modal--fullscreen-xl-down": fullscreenState.value === "xl",
    "e-modal--fullscreen-xxl-down": fullscreenState.value === "xxl",
    "e-modal--no-backdrop-movable": props.hideBackdrop && isMovable.value,
    "e-modal--allows-page-scroll": canScrollPage.value,
  },
  props.modalClass,
]);

/** Clases estructurales y de tamaño para el diálogo Bootstrap. */
const modalDialogClasses = computed(() => [
  {
    "modal-fullscreen":
      typeof fullscreenState.value === "boolean"
        ? fullscreenState.value
        : false,
    [`modal-fullscreen-${fullscreenState.value}-down`]:
      typeof fullscreenState.value === "string"
        ? fullscreenState.value
        : false,
    [`modal-${props.size}`]: props.size,
    "modal-dialog-centered": props.centered,
    "modal-dialog-scrollable": props.scrollable,
  },
  props.dialogClass,
]);

const computedBodyClasses = computed(() => [
  {
    [`bg-${props.bodyBgVariant}`]: props.bodyBgVariant,
    [`text-${props.bodyTextVariant}`]: props.bodyTextVariant,
  },
  props.bodyClass,
]);

const computedHeaderClasses = computed(() => [
  {
    [`bg-${props.headerBgVariant}`]: props.headerBgVariant,
    [`border-${props.headerBorderVariant}`]: props.headerBorderVariant,
    [`text-${props.headerTextVariant}`]: props.headerTextVariant,
  },
  (props.icon || props.multimedia) ? `p-3` : `p-3 pt-4`,
  props.headerClass,
]);

const computedFooterClasses = computed(() => [
  {
    [`bg-${props.footerBgVariant}`]: props.footerBgVariant,
    [`border-${props.footerBorderVariant}`]: props.footerBorderVariant,
    [`text-${props.footerTextVariant}`]: props.footerTextVariant,
  },
  props.footerClass,
]);

const computedTitleClasses = computed(() => [
  {
    ["visually-hidden"]: props.titleSrOnly,
    "flex-fill d-flex flex-column justify-content-center align-items-center":
      props.icon || (slots.icon && slots.icon?.().length > 0),
  },
  props.titleClass,
]);

const hasHeaderCloseSlot = computed(() => !!slots["header-close"]);

const computedCloseButtonClasses = computed(() => [
  {
    [`btn-close-content`]: hasHeaderCloseSlot.value,
    [`d-flex`]: hasHeaderCloseSlot.value,
    [`btn-close-white`]: !hasHeaderCloseSlot.value && props.headerCloseWhite,
    [`btn-close-grey-40`]: !hasHeaderCloseSlot.value && !props.headerCloseWhite,
    "align-self-start": props.icon || (slots.icon && slots.icon?.().length > 0),
  },
]);

const disableCancel = computed(() => props.cancelDisabled || props.busy);
const disableOk = computed(() => props.okDisabled || props.busy);


// 5. FUNCIONES Y LISTENERS DE EVENTOS

/** Calcula cuánto puede desplazarse el diálogo sin perder el acceso a la ventana o a su encabezado. */
function getDragBounds(
  position: number,
  size: number,
  viewportSize: number,
  headerPosition: number,
  headerSize: number
): DragBounds {
  const min = -position;
  const max = viewportSize - position - size;

  if (min <= max) {
    return { min, max };
  }

  // Si el diálogo supera el viewport, al menos mantenemos accesible el encabezado.
  const headerMin = -headerPosition;
  const headerMax = viewportSize - headerPosition - headerSize;

  if (headerMin <= headerMax) {
    return { min: headerMin, max: headerMax };
  }

  return { min: 0, max: 0 };
}

/** Limita un valor numérico a un intervalo cerrado. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Identifica controles interactivos para no iniciar arrastre o acciones del encabezado desde ellos. */
function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  return Boolean(target.closest(
    'button, a, input, select, textarea, [contenteditable="true"], [role="button"]'
  ));
}

/** Inicia el arrastre con Pointer Capture y conserva la posición y los límites iniciales. */
function startDrag(event: PointerEvent) {
  const header = event.currentTarget;

  if (
    isMinimized.value ||
    !isMovable.value ||
    !dialogRef.value ||
    !(header instanceof HTMLElement) ||
    event.button !== 0 ||
    !event.isPrimary
  ) {
    return;
  }

  if (isInteractiveTarget(event.target)) return;

  const dialog = dialogRef.value;
  const dialogRect = dialog.getBoundingClientRect();
  const contentRect =
    dialog.querySelector<HTMLElement>(".modal-content")?.getBoundingClientRect() ??
    dialogRect;
  const headerRect = header.getBoundingClientRect();
  const horizontalBounds = getDragBounds(
    contentRect.left,
    contentRect.width,
    window.innerWidth,
    headerRect.left,
    headerRect.width
  );
  const verticalBounds = getDragBounds(
    contentRect.top,
    contentRect.height,
    window.innerHeight,
    headerRect.top,
    headerRect.height
  );

  dragState.value = {
    pointerId: event.pointerId,
    captureElement: header,
    startX: event.clientX,
    startY: event.clientY,
    initialLeft: Number.parseFloat(dialog.style.left) || 0,
    initialTop: Number.parseFloat(dialog.style.top) || 0,
    minDeltaX: horizontalBounds.min,
    maxDeltaX: horizontalBounds.max,
    minDeltaY: verticalBounds.min,
    maxDeltaY: verticalBounds.max,
  };

  event.preventDefault();
  header.setPointerCapture(event.pointerId);
  isDragging.value = true;
}

/** Aplica el desplazamiento del puntero, limitado al viewport o al encabezado. */
function moveDrag(event: PointerEvent) {
  const state = dragState.value;

  if (
    !isMovable.value ||
    state?.pointerId !== event.pointerId ||
    !dialogRef.value
  ) {
    return;
  }

  event.preventDefault();

  const deltaX = clamp(
    event.clientX - state.startX,
    state.minDeltaX,
    state.maxDeltaX
  );
  const deltaY = clamp(
    event.clientY - state.startY,
    state.minDeltaY,
    state.maxDeltaY
  );

  dialogRef.value.style.left = `${state.initialLeft + deltaX}px`;
  dialogRef.value.style.top = `${state.initialTop + deltaY}px`;
}

/** Finaliza el arrastre y libera Pointer Capture, si esta instancia lo posee. */
function stopDrag(event?: PointerEvent) {
  const state = dragState.value;

  if (!state || (event && state.pointerId !== event.pointerId)) {
    return;
  }

  dragState.value = null;
  isDragging.value = false;

  if (state.captureElement.hasPointerCapture(state.pointerId)) {
    state.captureElement.releasePointerCapture(state.pointerId);
  }
}

/** Toma una copia de los estilos geométricos inline del diálogo. */
function getDialogGeometry(): ModalGeometryState | null {
  const dialog = dialogRef.value;

  if (!dialog) return null;

  return {
    position: dialog.style.position,
    margin: dialog.style.margin,
    left: dialog.style.left,
    top: dialog.style.top,
    width: dialog.style.width,
    height: dialog.style.height,
    minWidth: dialog.style.minWidth,
    minHeight: dialog.style.minHeight,
    maxWidth: dialog.style.maxWidth,
    maxHeight: dialog.style.maxHeight,
  };
}

/** Guarda la geometría actual antes de maximizar. */
function saveDialogGeometry() {
  savedGeometry.value = getDialogGeometry();
}

/** Restaura explícitamente los estilos geométricos de una copia guardada. */
function applyDialogGeometry(geometry: ModalGeometryState) {
  const dialog = dialogRef.value;

  if (!dialog) return;

  dialog.style.position = geometry.position;
  dialog.style.margin = geometry.margin;
  dialog.style.left = geometry.left;
  dialog.style.top = geometry.top;
  dialog.style.width = geometry.width;
  dialog.style.height = geometry.height;
  dialog.style.minWidth = geometry.minWidth;
  dialog.style.minHeight = geometry.minHeight;
  dialog.style.maxWidth = geometry.maxWidth;
  dialog.style.maxHeight = geometry.maxHeight;
}

/** Elimina los overrides geométricos inline para volver al layout de Bootstrap. */
function clearDialogGeometry() {
  const dialog = dialogRef.value;

  if (!dialog) return;

  dialog.style.removeProperty("position");
  dialog.style.removeProperty("margin");
  dialog.style.removeProperty("left");
  dialog.style.removeProperty("top");
  dialog.style.removeProperty("width");
  dialog.style.removeProperty("height");
  dialog.style.removeProperty("min-width");
  dialog.style.removeProperty("min-height");
  dialog.style.removeProperty("max-width");
  dialog.style.removeProperty("max-height");
}

/** Recupera la geometría previa a maximizar y limpia el estado guardado. */
function restoreDialogGeometry() {
  const dialog = dialogRef.value;
  const geometry = savedGeometry.value;

  if (!dialog || !geometry) return;

  applyDialogGeometry(geometry);
  savedGeometry.value = null;
}

/** Alterna entre el tamaño normal y fullscreen, conservando la geometría original. */
function toggleMaximize() {
  if (!showMaximizeButton.value || !dialogRef.value) return;

  stopDrag();

  if (isFullscreen.value) {
    fullscreenState.value = false;
    void nextTick(restoreDialogGeometry);
    return;
  }

  saveDialogGeometry();
  clearDialogGeometry();
  fullscreenState.value = true;
}

/** En el encabezado, doble clic restaura una ventana minimizada o maximiza una normal. */
function handleHeaderDoubleClick(event: MouseEvent) {
  if (isInteractiveTarget(event.target)) return;

  if (isMinimized.value) {
    restoreMinimized();
    return;
  }

  toggleMaximize();
}

/** Devuelve el dock compartido de ventanas minimizadas o lo crea si aún no existe. */
function getOrCreateMinimizedDock(): HTMLElement {
  const existingDock = document.querySelector<HTMLElement>(
    ".e-modal__minimized-dock"
  );

  if (existingDock) return existingDock;

  const dock = document.createElement("div");
  dock.className = "e-modal__minimized-dock";
  dock.setAttribute("role", "toolbar");
  dock.setAttribute("aria-label", "Ventanas minimizadas");
  document.body.appendChild(dock);

  return dock;
}

/** Retira el dock global cuando ya no contiene ventanas minimizadas. */
function removeEmptyMinimizedDock(dock: HTMLElement | null) {
  if (dock?.isConnected && dock.childElementCount === 0) {
    dock.remove();
  }
}

/** Restaura la misma instancia al body y reaplica su geometría después del teleport. */
function restoreMinimized(bringToFront = true) {
  if (!isMinimized.value) return;

  const dock = minimizedDock.value;
  if (bringToFront && element.value) {
    assignModalStackOrder(element.value);
  }
  isMinimized.value = false;

  void nextTick(() => {
    if (minimizedGeometry.value) {
      applyDialogGeometry(minimizedGeometry.value);
      minimizedGeometry.value = null;
    }

    removeEmptyMinimizedDock(dock);

    if (minimizedDock.value === dock) {
      minimizedDock.value = null;
    }
  });
}

/** Minimiza sin cerrar ni desmontar el modal; rechaza la acción si no cumple sus requisitos. */
function handleMinimize() {
  if (!canMinimize.value) return;

  if (isMinimized.value) {
    restoreMinimized();
    return;
  }

  minimizedGeometry.value = getDialogGeometry();
  clearDialogGeometry();
  minimizedDock.value = getOrCreateMinimizedDock();
  isMinimized.value = true;
}

/** Avanza una página del slider si existe una página siguiente. */
const nextPage = () => {
  if (Array.isArray(props.mediaSrc) && pageIndex.value < props.mediaSrc.length - 1) {
    pageIndex.value++;
  }
};

/** Retrocede una página del slider si existe una página anterior. */
const prevPage = () => {
  if (Array.isArray(props.mediaSrc) && pageIndex.value > 0) {
    pageIndex.value--;
  }
};

// --- Coordinación global del apilamiento de modales y backdrops ---
/** Devuelve los modales visibles, incluidos los que se renderizan minimizados. */
function getOpenModals(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(".modal.show"));
}

/** Asigna un orden de apertura estable que no depende de la posición del Teleport en el DOM. */
function assignModalStackOrder(modal: HTMLElement) {
  const highestOrder = Array.from(
    document.querySelectorAll<HTMLElement>(".modal")
  ).reduce((highest, current) => {
    const order = Number(current.dataset.eModalStackOrder);
    return Number.isFinite(order) ? Math.max(highest, order) : highest;
  }, 0);

  modal.dataset.eModalStackOrder = String(highestOrder + 1);
}

/** Excluye ventanas minimizadas y conserva el orden lógico aunque Teleport las mueva. */
function getStackedModals(): HTMLElement[] {
  const openModals = getOpenModals().filter(
    (modal) => !modal.classList.contains("e-modal--minimized")
  );

  openModals.forEach((modal) => {
    if (!Number.isFinite(Number(modal.dataset.eModalStackOrder))) {
      assignModalStackOrder(modal);
    }
  });

  return openModals.sort(
    (left, right) =>
      Number(left.dataset.eModalStackOrder) -
      Number(right.dataset.eModalStackOrder)
  );
}

/** Devuelve el modal propietario de la capa de backdrop activa de mayor prioridad. */
function getActiveBackdropOwner(openModals = getStackedModals()): HTMLElement | undefined {
  return [...openModals]
    .reverse()
    .find((modal) => getModalBackdrop(modal) !== undefined);
}

/** Finaliza el handoff y deja visible el backdrop del nivel que permanece abierto. */
function completeClosingBackdropHandoff() {
  const handoff = closingBackdropHandoff;
  if (!handoff) return;

  if (handoff.frame !== null) {
    window.cancelAnimationFrame(handoff.frame);
  }

  if (handoff.incoming.isConnected) {
    handoff.incoming.style.transition = handoff.incomingTransition;
    handoff.incoming.style.removeProperty("opacity");
  }
  if (handoff.outgoing.isConnected) {
    handoff.outgoing.style.transition = handoff.outgoingTransition;
    handoff.outgoing.style.opacity = "0";
  }

  const openModals = getStackedModals();
  const incomingOwner = backdropOwners.get(handoff.incoming);
  const incomingDepth = incomingOwner ? openModals.indexOf(incomingOwner) : -1;
  const parentDepth = incomingDepth >= 0 ? incomingDepth : openModals.length - 1;
  if (handoff.outgoing.isConnected && parentDepth >= 0) {
    const backdropZIndex = `${1050 + (parentDepth * 20)}`;
    handoff.outgoing.style.zIndex = backdropZIndex;
    handoff.incoming.style.zIndex = backdropZIndex;
  }

  closingBackdropHandoff = null;
}

/** Reanuda el transition CSS original antes de que Bootstrap gestione el hide del backdrop saliente. */
function releaseClosingBackdropTransition() {
  const handoff = closingBackdropHandoff;
  if (handoff?.outgoing.isConnected) {
    handoff.outgoing.style.transition = handoff.outgoingTransition;
  }
}

/** Revierte estilos y animación si un listener cancela el cierre después del evento hide. */
function cancelClosingBackdropHandoff() {
  const handoff = closingBackdropHandoff;
  if (!handoff) return;

  if (handoff.frame !== null) {
    window.cancelAnimationFrame(handoff.frame);
  }

  if (handoff.incoming.isConnected) {
    handoff.incoming.style.transition = handoff.incomingTransition;
    handoff.incoming.style.opacity = handoff.incomingOpacity;
    handoff.incoming.style.zIndex = handoff.incomingZIndex;
  }
  if (handoff.outgoing.isConnected) {
    handoff.outgoing.style.opacity = handoff.outgoingOpacity;
    handoff.outgoing.style.transition = handoff.outgoingTransition;
    handoff.outgoing.style.zIndex = handoff.outgoingZIndex;
  }

  closingBackdropHandoff = null;
}

/** Anima en paralelo ambos backdrops y compensa sus opacidades para mantener estable el oscurecimiento. */
function startClosingBackdropHandoff(
  outgoing: HTMLElement,
  incoming: HTMLElement,
  parentDepth: number
) {
  if (
    closingBackdropHandoff?.outgoing === outgoing &&
    closingBackdropHandoff.incoming === incoming
  ) {
    return;
  }

  cancelClosingBackdropHandoff();

  const outgoingStyle = getComputedStyle(outgoing);
  const durationValues = outgoingStyle.transitionDuration
    .split(",")
    .map((value) => {
      const duration = Number.parseFloat(value);
      return value.trim().endsWith("ms") ? duration : duration * 1000;
    });
  const duration = Math.max(0, ...durationValues);
  const outgoingOpacity = Number.parseFloat(outgoingStyle.opacity);
  const handoff = {
    outgoing,
    incoming,
    incomingOpacity: incoming.style.opacity,
    incomingTransition: incoming.style.transition,
    incomingZIndex: incoming.style.zIndex,
    outgoingOpacity: outgoing.style.opacity,
    outgoingTransition: outgoing.style.transition,
    outgoingZIndex: outgoing.style.zIndex,
    outgoingStartOpacity: Number.isFinite(outgoingOpacity)
      ? outgoingOpacity
      : 0.5,
    duration,
    startTime: performance.now(),
    targetOpacity: 0.5,
    frame: null as number | null,
  };
  closingBackdropHandoff = handoff;

  incoming.style.zIndex = `${1050 + (parentDepth * 20)}`;
  incoming.style.transition = "none";
  incoming.style.removeProperty("opacity");
  const configuredOpacity = Number.parseFloat(
    getComputedStyle(incoming).opacity
  );
  if (Number.isFinite(configuredOpacity)) {
    handoff.targetOpacity = configuredOpacity;
  }

  incoming.style.opacity = "0";
  outgoing.style.transition = "none";
  outgoing.style.opacity = String(handoff.outgoingStartOpacity);

  const updateOpacity = (timestamp: number) => {
    if (closingBackdropHandoff !== handoff) return;

    if (!outgoing.isConnected || !incoming.isConnected) {
      completeClosingBackdropHandoff();
      return;
    }

    const progress =
      handoff.duration > 0
        ? Math.min(1, (timestamp - handoff.startTime) / handoff.duration)
        : 1;
    const outgoingOpacity =
      handoff.outgoingStartOpacity * (1 - progress);
    const remainingOpacity = 1 - outgoingOpacity;
    const incomingOpacity =
      remainingOpacity > 0
        ? (handoff.targetOpacity - outgoingOpacity) / remainingOpacity
        : 0;

    incoming.style.opacity = String(
      Math.max(0, Math.min(handoff.targetOpacity, incomingOpacity))
    );

    outgoing.style.opacity = String(outgoingOpacity);

    if (progress >= 1) {
      completeClosingBackdropHandoff();
      return;
    }

    handoff.frame = window.requestAnimationFrame(updateOpacity);
  };

  handoff.frame = window.requestAnimationFrame(updateOpacity);
}

/** Asigna profundidad y visibilidad a las capas de backdrop según el stack activo. */
function updateBackdrops() {
  const openModals = getStackedModals();
  const backdrops = Array.from(
    document.querySelectorAll<HTMLElement>(".modal-backdrop")
  );

  if (openModals.length === 0 || backdrops.length === 0) return;

  const activeBackdropOwner = getActiveBackdropOwner(openModals);
  const activeBackdrop = activeBackdropOwner
    ? getModalBackdrop(activeBackdropOwner)
    : backdrops.at(-1);
  if (!activeBackdrop) return;

  const handoff = closingBackdropHandoff;

  backdrops.forEach((backdrop, index) => {
    if (handoff?.outgoing === backdrop || handoff?.incoming === backdrop) return;

    const owner = backdropOwners.get(backdrop);
    const ownerDepth = owner ? openModals.indexOf(owner) : -1;
    const depth = ownerDepth >= 0 ? ownerDepth : Math.min(index, openModals.length - 1);
    backdrop.style.zIndex = `${1050 + (depth * 20)}`;

    if (backdrop === activeBackdrop) {
      backdrop.style.removeProperty("opacity");
    } else {
      backdrop.style.opacity = "0";
    }
  });
}

/** Recalcula la profundidad visual después de cambiar la prioridad de una ventana. */
function updateModalStack() {
  getStackedModals().forEach((modal, depth) => {
    modal.style.zIndex = `${1055 + (depth * 20)}`;
  });
  updateBackdrops();
}

/** Espera el fin del fade del modal para devolver el transition original a Bootstrap. */
useEventListener(element, "transitionend", (event) => {
  if (
    !shouldHandoffBackdrop ||
    !(event instanceof TransitionEvent) ||
    event.target !== element.value ||
    event.propertyName !== "opacity"
  ) {
    return;
  }

  shouldHandoffBackdrop = false;
  releaseClosingBackdropTransition();
});

/** Coordina el scroll global según la capa activa y excluye ventanas minimizadas. */
function updatePageScroll() {
  const openModals = getOpenModals();
  const stackedModals = getStackedModals();
  const minimizedModals = openModals.filter((modal) =>
    modal.classList.contains("e-modal--minimized")
  );
  const activeBackdropOwner = getActiveBackdropOwner(stackedModals);
  const hasBackdropLayer =
    document.querySelector(".modal-backdrop") !== null;

  let shouldAllowPageScroll = false;
  if (activeBackdropOwner) {
    shouldAllowPageScroll = activeBackdropOwner.classList.contains(
      "e-modal--allows-page-scroll"
    );
  } else if (!hasBackdropLayer && stackedModals.length > 0) {
    shouldAllowPageScroll = stackedModals.every((modal) =>
      modal.classList.contains("e-modal--allows-page-scroll")
    );
  } else if (!hasBackdropLayer && minimizedModals.length > 0) {
    shouldAllowPageScroll = minimizedModals.every((modal) =>
      modal.classList.contains("e-modal--allows-page-scroll")
    );
  }

  document.body.classList.toggle(
    "e-modal--page-scroll",
    shouldAllowPageScroll
  );
  document.body.classList.toggle("e-modal--backdrop-active", hasBackdropLayer);
}

/** Eleva una ventana alcanzable cuando recibe interacción o foco, sin cruzar un backdrop. */
function bringModalToFront() {
  const modal = element.value;
  if (
    !modal ||
    isMinimized.value ||
    !modal.classList.contains("show") ||
    !isMovable.value ||
    !minimizeInitialization.value?.hideBackdrop
  ) {
    return;
  }

  const openModals = getStackedModals();
  const modalIndex = openModals.indexOf(modal);
  if (modalIndex < 0 || openModals.at(-1) === modal) return;

  const backdropOwner = getActiveBackdropOwner(openModals);
  if (backdropOwner && modalIndex < openModals.indexOf(backdropOwner)) {
    return;
  }
  if (
    !backdropOwner &&
    document.body.classList.contains("e-modal--backdrop-active")
  ) {
    return;
  }

  assignModalStackOrder(modal);
  updateModalStack();
}

/** Reenvía al consumidor la cancelación desde el pie predeterminado. */
function handleFooterCancel(event: MouseEvent) {
  emit("cancel", event);
}

/** Cancela el temporizador pendiente de medición multimedia. */
function clearMediaHeightTimeout() {
  if (mediaHeightTimeout !== undefined) {
    clearTimeout(mediaHeightTimeout);
    mediaHeightTimeout = undefined;
  }
}

/** Detiene y limpia el listener de clic exterior registrado para esta instancia. */
function stopClickOutside() {
  stopOutside.value?.();
  stopOutside.value = undefined;
}

/** Pausa videos al completar el cierre del modal. */
function pauseModalVideos() {
  element.value?.querySelectorAll("video").forEach((video) => video.pause());
}

/** Inicializa el comportamiento posterior a shown y sincroniza capas, scroll y contenido multimedia. */
function handleModalShown() {
  registerClickOutside();

  // Se reutiliza tras shown y al insertar backdrops para mantener sincronizado el orden visual.
  const applyZIndex = () => {
    const openModals = getStackedModals();
    if (element.value && openModals.length > 0) {
      const depth = openModals.indexOf(element.value);
      const safeDepth = depth >= 0 ? depth : openModals.length - 1;
      element.value.style.zIndex = `${1055 + (safeDepth * 20)}`;
    }
    updateBackdrops();
  };

  applyZIndex();
  updatePageScroll();

  if (!backdropObserver) {
    backdropObserver = new MutationObserver(() => {
      applyZIndex();
    });
    backdropObserver.observe(document.body, { childList: true, subtree: false });
  }

  if (props.mediaBodyHeight) {
    void nextTick(() => {
      if (isComponentUnmounted || !element.value?.classList.contains("show")) {
        return;
      }

      adjustMediaBodyHeight();
      clearMediaHeightTimeout();

      mediaHeightTimeout = setTimeout(() => {
        mediaHeightTimeout = undefined;
        adjustMediaBodyHeight();
      }, 200);
    });
  }
}

/** Informa a Bootstrap de cambios de viewport mientras la instancia está visible. */
function handleWindowResize() {
  if (
    lifecycleState === "shown" ||
    lifecycleState === "showing"
  ) {
    instance.value?.handleUpdate();
  }
}

// API imperativa usada por los controles internos y expuesta al consumidor.
/** Solicita a Bootstrap cerrar la instancia actual. */
function hide() {
  instance.value?.hide();
}

/** Solicita a Bootstrap abrir la instancia actual. */
function modalShow() {
  instance.value?.show();
}

/** Alterna la visibilidad mediante la instancia Bootstrap. */
function toggle() {
  instance.value?.toggle();
}

/** Indica si el nodo raíz conserva la clase visible de Bootstrap. */
function isVisible(): boolean {
  return element.value?.classList.contains("show") ?? false;
}

/** Devuelve el nodo raíz para integraciones que requieren acceso directo al DOM. */
function getElement(): HTMLElement | undefined {
  return element.value;
}

/** Emite ok y un evento hide cancelable; solo cierra si nadie cancela hide. */
function handleOk() {
  const event = new CustomEvent("hide", {
    cancelable: true,
  });

  emit("ok", event);

  const doClose = element.value?.dispatchEvent(event);
  if (doClose) {
    hide();
  }
}

/** Emite cancel y solicita el cierre sin opción de cancelarlo desde ese evento. */
function handleCancel() {
  const event = new CustomEvent("hide", {
    cancelable: false,
  });

  emit("cancel", event);
  hide();
}

/** Registra el clic exterior, dejando la decisión solo al modal superior del stack. */
function registerClickOutside() {
  void nextTick(() => {
    if (
      isComponentUnmounted ||
      !element.value?.classList.contains("show") ||
      props.noCloseOnBackdrop ||
      !dialogRef.value
    ) {
      return;
    }

    stopClickOutside();
    stopOutside.value = onClickOutside(dialogRef, (event) => {
      const modalVisible = element.value?.classList.contains("show");
      if (!modalVisible) return;

      // Solamente el modal superior puede gestionar el clic externo.
      const openModals = getStackedModals();
      const topModal = openModals.at(-1);

      if (topModal !== element.value) return;

      // Evitar que el clic en otro modal cierre esta instancia.
      const targetElement = event.target as Element;
      const targetModal = targetElement?.closest(".modal");

      if (targetModal && targetModal !== element.value) {
        return;
      }

      emit("click-outside");

      // Sin backdrop, Bootstrap no gestiona el cierre por clic externo.
      if (props.hideBackdrop) {
        hide();
      }
    });
  });
}

/** Ajusta o mide la altura del cuerpo multimedia según mediaBodyHeight. */
function adjustMediaBodyHeight() {
  void nextTick(() => {
    if (isComponentUnmounted) return;

    const modalBody = modalBodyRef.value;

    if (!modalBody || !props.multimedia) return;

    // Si no hay altura configurada, eliminamos cualquier altura anterior.
    if (
      props.mediaBodyHeight === undefined ||
      props.mediaBodyHeight === false
    ) {
      modalBody.style.removeProperty('height');
      return;
    }

    // Altura explícita en píxeles o valor CSS.
    if (
      typeof props.mediaBodyHeight === 'number' ||
      typeof props.mediaBodyHeight === 'string'
    ) {
      modalBody.style.height = typeof props.mediaBodyHeight === 'number'
        ? `${props.mediaBodyHeight}px`
        : props.mediaBodyHeight;

      return;
    }

    // mediaBodyHeight=true: igualamos todas las páginas
    // utilizando la altura de su contenido más extenso.
    if (!Array.isArray(props.mediaSrc)) return;

    const mediaArray = props.mediaSrc as {
      media: string;
      title?: string;
      content?: string;
      subtitles?: string;
    }[];

    let maxHeight = 0;

    mediaArray.forEach((item) => {
      // Clonamos el body real para conservar sus clases y estilos.
      const measuringBody = modalBody.cloneNode(false) as HTMLElement;

      // El componente utiliza interpolación de Vue para mostrar content.
      // Por eso medimos texto, no HTML.
      measuringBody.textContent = item.content || '';

      // Evitamos que el elemento auxiliar intervenga en el layout visible.
      Object.assign(measuringBody.style, {
        position: 'absolute',
        top: '0',
        left: '-100000px',
        visibility: 'hidden',
        pointerEvents: 'none',

        // Conservamos el ancho real del body.
        width: `${modalBody.getBoundingClientRect().width}px`,

        // Permitimos medir todo el contenido sin restricciones anteriores.
        height: 'auto',
        minHeight: '0',
        maxHeight: 'none',
        overflow: 'visible',
      });

      // Se agrega junto al body real para conservar los selectores
      // y estilos heredados de EModal y Bootstrap.
      modalBody.parentElement?.appendChild(measuringBody);

      // scrollHeight incluye contenido y padding.
      maxHeight = Math.max(maxHeight, measuringBody.scrollHeight);

      measuringBody.remove();
    });

    if (maxHeight > 0) {
      modalBody.style.height = `${maxHeight}px`;
    }
  });
}

// Adapta los eventos de Bootstrap al estado reactivo y al contrato Vue del componente.
useEventListener(element, "pointerdown", bringModalToFront);
useEventListener(element, "focusin", bringModalToFront);

useEventListener(element, "show.bs.modal", (event) => {
  const existingBackdrops = new Set(
    document.querySelectorAll<HTMLElement>(".modal-backdrop")
  );
  lifecycleState = "showing";

  emit("show", event);

  if (event.defaultPrevented) {
    lifecycleState = "hidden";
    return;
  }

  if (isComponentUnmounting) return;

  if (element.value && !minimizeInitialization.value?.hideBackdrop) {
    queueBackdropAssociation(element.value, event, existingBackdrops);
    void Promise.resolve().then(() => {
      if (!event.defaultPrevented && !isComponentUnmounting) {
        document.body.classList.add("e-modal--backdrop-active");
      }
      updatePageScroll();
    });
  }

  // Place the modal above the existing stack before Bootstrap starts its transitions.
  if (element.value) {
    const openModals = getStackedModals();
    assignModalStackOrder(element.value);
    const depth = openModals.length;
    element.value.style.zIndex = `${1055 + (depth * 20)}`;

    const previousBackdrop = [...openModals]
      .reverse()
      .map(getModalBackdrop)
      .find((backdrop) => backdrop?.isConnected);
    if (
      element.value.classList.contains("fade") &&
      !minimizeInitialization.value?.hideBackdrop &&
      previousBackdrop
    ) {
      previousBackdrop.style.opacity = "0";
    }
  }

  isBootstrapShown.value = true;
  emit("update:modelValue", true);
});

// Bootstrap terminó de mostrar el modal: registra interacciones y recalcula el stack.
useEventListener(element, "shown.bs.modal", (event) => {
  lifecycleState = "shown";

  if (isComponentUnmounting) return;

  handleModalShown();
  emit("shown", event);
});

// Conserva el cierre cancelable y sincroniza Vue antes de que Bootstrap quite .show.
useEventListener(element, "hide.bs.modal", (event) => {
  stopDrag();

  if (isComponentUnmounting) {
    lifecycleState = "hiding";
    void nextTick(() => {
      if (event.defaultPrevented) {
        disposeOnUnmount?.();
      }
    });
    return;
  }

  shouldRestoreFocusAfterHide = false;
  const focusedElement = document.activeElement;
  const focusWasInsideModal =
    focusedElement instanceof Node &&
    element.value?.contains(focusedElement) === true;
  lifecycleState = "hiding";
  emit("hide", event);

  if (event.defaultPrevented) {
    lifecycleState = "shown";
    return;
  }

  shouldRestoreFocusAfterHide =
    focusWasInsideModal && document.activeElement === focusedElement;
  if (
    shouldRestoreFocusAfterHide &&
    focusedElement instanceof HTMLElement
  ) {
    focusedElement.blur();
  }

  const openModals = getStackedModals();
  const closingModalIndex = element.value
    ? openModals.indexOf(element.value)
    : -1;
  const outgoingBackdrop = element.value
    ? getModalBackdrop(element.value)
    : undefined;
  const incomingModal = closingModalIndex > 0
    ? openModals
      .slice(0, closingModalIndex)
      .reverse()
      .find((modal) => getModalBackdrop(modal))
    : undefined;
  const incomingBackdrop = incomingModal
    ? getModalBackdrop(incomingModal)
    : undefined;

  shouldHandoffBackdrop = Boolean(
    element.value?.classList.contains("fade") &&
    outgoingBackdrop &&
    incomingBackdrop &&
    openModals.at(-1) === element.value
  );

  if (shouldHandoffBackdrop) {
    if (outgoingBackdrop && incomingBackdrop && incomingModal) {
      startClosingBackdropHandoff(
        outgoingBackdrop,
        incomingBackdrop,
        openModals.indexOf(incomingModal)
      );
    }
  }

  isBootstrapShown.value = false;
  emit("update:modelValue", false);

  void nextTick(() => {
    if (!event.defaultPrevented || lifecycleState !== "hiding") return;

    shouldHandoffBackdrop = false;
    cancelClosingBackdropHandoff();

    if (isComponentUnmounting) {
      disposeOnUnmount?.();
    } else {
      lifecycleState = "shown";
      isBootstrapShown.value = true;
    }
  });
});

// La transición y el backdrop terminaron; limpia estado temporal y devuelve el foco al nivel superior.
useEventListener(element, "hidden.bs.modal", () => {
  pauseModalVideos();
  lifecycleState = "hidden";

  if (isComponentUnmounting) return;

  shouldHandoffBackdrop = false;
  const restoreFocus = shouldRestoreFocusAfterHide;
  shouldRestoreFocusAfterHide = false;
  completeClosingBackdropHandoff();
  restoreMinimized(false);

  isBootstrapShown.value = false;

  stopDrag();
  stopClickOutside();
  clearMediaHeightTimeout();
  emit("hidden");

  if (element.value) {
    forgetModalBackdrop(element.value);
    element.value.style.zIndex = "";
    delete element.value.dataset.eModalStackOrder;
  }

  if (backdropObserver) {
    backdropObserver.disconnect();
    backdropObserver = null;
  }

  void nextTick(() => {
    updateBackdrops();
    void Promise.resolve().then(updatePageScroll);

    const openModals = getStackedModals();
    const activeElement = document.activeElement;
    const focusIsUnclaimed =
      activeElement === document.body ||
      activeElement === document.documentElement ||
      element.value?.contains(activeElement) === true;
    if (restoreFocus && focusIsUnclaimed) {
      openModals.at(-1)?.focus();
    }
  });

  document.body.classList.toggle(
    "modal-open",
    getOpenModals().length > 0
  );
});

// Reenvía los intentos de cierre bloqueados por la configuración estática de Bootstrap.
useEventListener(element, "hidePrevented.bs.modal", (event) => {
  if (!isComponentUnmounting) {
    emit("hide-prevented", event);
  }
});

// 6. OBSERVADORES (WATCHERS)

// Conserva la geometría cuando cambia la prop fullscreen desde el exterior.
watch(() => props.fullscreen, (value) => {
  if (Boolean(value) && !isFullscreen.value) {
    saveDialogGeometry();
    clearDialogGeometry();
  }

  fullscreenState.value = value;

  if (!value) {
    void nextTick(restoreDialogGeometry);
  }
});

// Si desaparece la capacidad de maximizar, evita dejar el modal en fullscreen sin control de restauración.
watch(showMaximizeButton, (enabled) => {
  if (
    !enabled &&
    props.fullscreen === false &&
    fullscreenState.value === true
  ) {
    fullscreenState.value = false;
    void nextTick(restoreDialogGeometry);
  }
});

// Al deshabilitar movable, detiene el arrastre y elimina la posición manual.
watch(isMovable, (value) => {
  if (!value) {
    stopDrag();
    dialogRef.value?.style.removeProperty("left");
    dialogRef.value?.style.removeProperty("top");
  }
});

// Recalcula la clase global de scroll cuando cambian los requisitos de esta instancia.
watch(canScrollPage, () => {
  void nextTick(updatePageScroll);
});

// Si se revoca algún requisito de minimización, restaura la ventana al body.
watch(canMinimize, (enabled) => {
  if (!enabled) {
    restoreMinimized();
  }
});

// Una nueva fuente multimedia comienza desde la primera página.
watch(() => props.mediaSrc, () => {
  pageIndex.value = 0;
});

// Recalcula la altura del cuerpo cuando cambia la página del slider.
watch(pageIndex, () => {
  if (props.mediaBodyHeight) {
    adjustMediaBodyHeight();
  }
});

// Mantiene compatibilidad con los dos mecanismos públicos de apertura.
watch(() => props.modelValue, (value) => {
  if (value) {
    instance.value?.show();
  } else {
    instance.value?.hide();
  }
});

// API histórica alternativa a v-model; no es necesario usarla junto con modelValue.
watch(() => props.show, (value) => {
  if (value) {
    instance.value?.show();
  } else {
    instance.value?.hide();
  }
});

// 7. CICLO DE VIDA (LIFECYCLE HOOKS)
// Bootstrap captura backdrop, teclado y focus al crear su instancia; estos ajustes requieren recrearla.
onMounted(() => {
  minimizeInitialization.value = {
    hideBackdrop: props.hideBackdrop,
    noFocus: props.noFocus,
    noCloseOnBackdrop: props.noCloseOnBackdrop,
  };

  let backdropSetting: boolean | "static" = true;

  if (props.hideBackdrop) {
    backdropSetting = false;
  } else if (props.noCloseOnBackdrop) {
    backdropSetting = "static";
  }

  instance.value = new Modal(element.value as HTMLElement, {
    backdrop: backdropSetting,
    keyboard: !props.noCloseOnEsc,
    focus: !props.noFocus,
  });

  window.addEventListener("resize", handleWindowResize);

  if (props.modelValue || props.show) {
    instance.value?.show();
  }
});

// Espera las transiciones de Bootstrap antes de destruir la instancia y su nodo teletransportado.
onBeforeUnmount(() => {
  isComponentUnmounting = true;
  isComponentUnmounted = true;
  shouldHandoffBackdrop = false;
  completeClosingBackdropHandoff();

  // Liberar recursos propios.
  pauseModalVideos();
  stopDrag();
  stopClickOutside();
  clearMediaHeightTimeout();
  window.removeEventListener("resize", handleWindowResize);

  if (backdropObserver) {
    backdropObserver.disconnect();
    backdropObserver = null;
  }

  const modalElement = element.value;
  const bootstrapInstance = instance.value;

  if (!modalElement || !bootstrapInstance) {
    instance.value = undefined;
    updatePageScroll();
    void nextTick(() => removeEmptyMinimizedDock(minimizedDock.value));
    return;
  }

  const modal: HTMLElement = modalElement as HTMLElement;
  const modalInstance: Modal = bootstrapInstance as Modal;
  const shouldRestoreFocusAfterUnmount =
    modal.contains(document.activeElement);

  let disposed = false;

  /** Retira los listeners temporales que esperan la finalización de Bootstrap. */
  function removeLifecycleListeners() {
    modal.removeEventListener("shown.bs.modal", handleShown);
    modal.removeEventListener("hidden.bs.modal", handleHidden);
  }

  /** Libera Bootstrap y restaura la coordinación global después del desmontaje. */
  function disposeModal() {
    if (disposed) return;

    disposed = true;
    disposeOnUnmount = null;

    removeLifecycleListeners();

    // Liberar la instancia de Bootstrap.
    modalInstance.dispose();
    forgetModalBackdrop(modal);
    delete modal.dataset.eModalStackOrder;
    instance.value = undefined;

    // Actualizar el documento después de retirar el componente.
    void nextTick(() => {
      if (modal.isConnected) {
        modal.remove();
      }
      removeEmptyMinimizedDock(minimizedDock.value);

      const openModals = getOpenModals();
      const stackedModals = openModals.filter(
        (openModal) => !openModal.classList.contains("e-modal--minimized")
      );

      document.body.classList.toggle(
        "modal-open",
        openModals.length > 0
      );

      updateBackdrops();
      updatePageScroll();

      const activeElement = document.activeElement;
      const focusIsUnclaimed =
        activeElement === document.body ||
        activeElement === document.documentElement;
      if (shouldRestoreFocusAfterUnmount && focusIsUnclaimed) {
        stackedModals.at(-1)?.focus();
      }
    });
  }

  disposeOnUnmount = disposeModal;

  /** Cuando termina una apertura iniciada durante el desmontaje, solicita el cierre final. */
  function handleShown() {
    lifecycleState = "shown";
    modalInstance.hide();
  }

  /** Completa la liberación si Bootstrap termina de ocultar la instancia desmontada. */
  function handleHidden() {
    lifecycleState = "hidden";
    disposeModal();
  }

  // Estos listeners se mantienen hasta que Bootstrap termine el ciclo de vida pendiente.
  modal.addEventListener("shown.bs.modal", handleShown, { once: true });
  modal.addEventListener("hidden.bs.modal", handleHidden, { once: true });

  // Si el desmontaje coincide con una transición, difiere la liberación hasta shown/hidden.
  void nextTick(() => {
    if (disposed) return;

    switch (lifecycleState) {
      case "showing":
      case "hiding":
        // Esperar shown.bs.modal o hidden.bs.modal.
        break;

      case "shown":
        // Solicitar cierre sin emitir el evento Vue cancelable.
        modalInstance.hide();
        break;

      case "hidden":
        disposeModal();
        break;
    }
  });
});

// 8. EXPOSE (API PÚBLICA AMPLIADA)
defineExpose({
  show: modalShow,
  hide,
  toggle,
  isVisible,  // Consulta el estado real de Bootstrap sin depender de un estado externo sincronizado.
  getElement, // Expone el nodo raíz para integraciones que requieren acceso directo al DOM.
});
</script>

<style lang="scss">
  .e-modal-media {
    aspect-ratio: v-bind('props.aspectRatio');
  }
</style>