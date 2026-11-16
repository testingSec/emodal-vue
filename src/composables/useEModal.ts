
import {
  createVNode,
  getCurrentInstance,
  h,
  isVNode,
  render,
  type AppContext,
  type Component,
  type VNode,
  type Slots,
} from 'vue';

import EModal from '../components/EModal.vue';

/**
 * Contenido dinámico de un modal mediante un componente,
 * con sus propiedades y slots correspondientes.
 */
export interface ModalContentOptions {
  /** Componente Vue que se renderizará dentro del modal. */
  component: Component;

  /** Propiedades que recibirá el componente. */
  props?: Record<string, unknown>;

  /** Slots que recibirá el componente. */
  slots?: Slots;
}

/**
 * Tipos de contenido admitidos por el modal programático.
 *
 * - string: texto plano.
 * - VNode: nodo Vue previamente creado.
 * - Component: componente Vue, incluidos los componentes funcionales.
 * - ModalContentOptions: componente con props y slots.
 */
export type ModalContent =
  | string
  | VNode
  | Component
  | ModalContentOptions;

/**
 * Opciones de configuración para la apertura de modales programáticos.
 */
export interface OpenModalOptions {
  /** Título principal que se mostrará en la cabecera del modal. */
  title?: string;

  /** Contenido del cuerpo del modal. */
  content?: ModalContent;

  /** Texto personalizado para el botón de confirmación / OK. */
  okTitle?: string;

  /** Texto personalizado para el botón de cancelación. */
  cancelTitle?: string;

  /** Variante de color Bootstrap para el botón OK. */
  okVariant?: string;

  /** Variante de color Bootstrap para el botón Cancelar. */
  cancelVariant?: string;

  /** Tamaño del modal ('sm', 'md', 'lg', 'xl'). */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Centra verticalmente el modal en la pantalla. */
  centered?: boolean;

  /** Muestra únicamente el botón OK. */
  okOnly?: boolean;

  /** Evita que el modal se cierre al hacer clic en el backdrop. */
  noCloseOnBackdrop?: boolean;

  /** Evita que el modal se cierre al presionar ESC. */
  noCloseOnEsc?: boolean;

  /** Expande el modal a pantalla completa. */
  fullscreen?: boolean | string;

  /** Callback al aceptar el modal. */
  onOk?: (event: Event) => void;

  /** Callback al cancelar el modal. */
  onCancel?: (event: Event) => void;

  /** Callback cuando finaliza la transición de cierre. */
  onHidden?: (event: Event) => void;

  /** Permite cualquier propiedad adicional aceptada por EModal. */
  [key: string]: unknown;
}

/**
 * Procesa el contenido dinámico del modal.
 *
 * Admite texto, VNodes, componentes y descriptores de componentes.
 */
function renderModalContent(content?: ModalContent): VNode | string | null {
  if (content === undefined || content === null) {
    return null;
  }

  if (typeof content === 'string') {
    return content;
  }

  if (isVNode(content)) {
    return content;
  }

  if (
    typeof content === 'object'
    && 'component' in content
  ) {
    return h(
      content.component,
      content.props,
      content.slots
    );
  }

  return h(content as Component);
}

/**
 * Abre un modal de forma programática montándolo dinámicamente en el DOM.
 *
 * @param options Configuración visual y de comportamiento del modal.
 * @param appContext Contexto de la aplicación Vue desde la que se invoca.
 * @returns Una Promesa que resuelve a `true` si se acepta, o `false` si se cancela/cierra.
 */
function showModal(
  options: OpenModalOptions,
  appContext?: AppContext
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('showModal requiere un entorno de navegador.'));
      return;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);

    const {
      content,
      title = '',
      okOnly = false,
      onOk,
      onCancel,
      onHidden,
      ...modalProps
    } = options;

    let settled = false;
    let destroyed = false;

    /**
     * Resuelve la promesa una sola vez.
     */
    const settle = (value: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(value);
    };

    /**
     * Desmonta y elimina el contenedor del modal.
     * La operación es idempotente.
     */
    const destroy = () => {
      if (destroyed) {
        return;
      }

      destroyed = true;

      render(null, container);
      container.remove();
    };

    /**
     * Aceptación del modal.
     */
    const handleOk = (event: Event) => {
      try {
        onOk?.(event);
      } finally {
        settle(true);
      }
    };

    /**
     * Cancelación del modal.
     */
    const handleCancel = (event: Event) => {
      try {
        onCancel?.(event);
      } finally {
        settle(false);
      }
    };

    /**
     * Finalización de la transición de cierre.
     *
     * Si el modal se cerró mediante backdrop, ESC o cruz,
     * la promesa se resuelve como false.
     */
    const handleHidden = (event: Event) => {
      try {
        onHidden?.(event);
      } finally {
        settle(false);
        destroy();
      }
    };

    const vnode = createVNode(
      EModal,
      {
        ...modalProps,

        // El modal programático siempre debe abrirse inicialmente.
        modelValue: true,

        title,
        okOnly,

        // Los eventos internos se combinan con los callbacks del usuario.
        onOk: handleOk,
        onCancel: handleCancel,
        onHidden: handleHidden,
      },
      {
        default: () => renderModalContent(content),
      }
    );

    // Hereda plugins, provides y configuración global de la aplicación.
    if (appContext) {
      vnode.appContext = appContext;
    }

    render(vnode, container);
  });
}

/**
 * Muestra un modal de alerta simple con un solo botón de aceptación.
 *
 * @param title Título de la alerta.
 * @param message Mensaje o contenido informativo.
 * @param options Opciones adicionales de configuración.
 * @param appContext Contexto de la aplicación Vue.
 */
function showAlert(
  title: string,
  message: ModalContent,
  options: Partial<OpenModalOptions> = {},
  appContext?: AppContext
): Promise<boolean> {
  return showModal({
    ...options,
    title,
    content: message,
    okOnly: true,
    okTitle: 'Aceptar',
  }, appContext);
}

/**
 * Muestra un modal de confirmación con opciones de Aceptar y Cancelar.
 *
 * @param title Título de la confirmación.
 * @param message Mensaje o contenido informativo.
 * @param options Opciones adicionales de configuración.
 * @param appContext Contexto de la aplicación Vue.
 */
function showConfirm(
  title: string,
  message: ModalContent,
  options: Partial<OpenModalOptions> = {},
  appContext?: AppContext
): Promise<boolean> {
  return showModal({
    ...options,
    title,
    content: message,
    okOnly: false,
    okTitle: 'Aceptar',
    cancelTitle: 'Cancelar',
  }, appContext);
}

/**
 * Composable para gestionar modales programáticos mediante Promesas.
 *
 * Captura el contexto de la aplicación Vue desde el componente
 * que invoca el composable.
 */
export function useEModal() {
  const appContext = getCurrentInstance()?.appContext;

  return {
    showModal: (options: OpenModalOptions) =>
      showModal(options, appContext),

    showAlert: (
      title: string,
      message: ModalContent,
      options?: Partial<OpenModalOptions>
    ) => showAlert(title, message, options, appContext),

    showConfirm: (
      title: string,
      message: ModalContent,
      options?: Partial<OpenModalOptions>
    ) => showConfirm(title, message, options, appContext),
  };
}