<template>
  <!--
    Banco de pruebas manual para EModal y sus integraciones del playground.
    Utiliza el componente independiente, Bootstrap y los adaptadores locales.
    No reemplaza una suite automatizada ni marca casos como aprobados automáticamente.
  -->
  <main class="eda-lab eda-lab--modal">
    <header class="top">
      <div>
        <p class="eyebrow">EMODAL · LABORATORIO</p>
        <h1>EModal — laboratorio interactivo</h1>
        <p class="muted">
          Explorá el componente real y el composable useEModal. Cambiá propiedades,
          abrí instancias simultáneas y observá los eventos y resultados.
        </p>
      </div>
      <div class="preset">
        <label>
          Escenario prearmado
          <select v-model="preset" @change="applyPreset(preset)">
            <option v-for="item in presets" :key="item.id" :value="item.id">
              {{ item.label }}
            </option>
          </select>
        </label>
        <button type="button" class="secondary" @click="resetLab">Restablecer</button>
      </div>
    </header>

    <div class="status" aria-live="polite">
      <span>
        <i class="dot" :class="mainVisible ? 'on' : ''"></i>
        Modal principal: <b>{{ mainVisible ? 'visible' : 'oculto' }}</b>
      </span>
      <span>Modelo: <b>{{ config.modelValue }}</b></span>
      <span>Tamaño: <b>{{ config.size || 'default' }}</b></span>
      <span>Movible: <b>{{ config.movable ? 'Sí' : 'No' }}</b></span>
      <span>Multimedia: <b>{{ config.multimedia ? 'Sí' : 'No' }}</b></span>
      <span>Eventos: <b>{{ eventLog.length }}</b></span>
    </div>

    <p class="hint">
      Los controles resaltados en ámbar requieren recrear la instancia para aplicar los cambios.
      Minimizar requiere hideBackdrop, noFocus, noCloseOnBackdrop y allowPageScroll;
      noMinimizable permite ocultar esa función.
    </p>

    <div class="layout">
      <aside class="panel controls">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">PROPIEDADES</p>
            <h2>Configuración</h2>
          </div>
          <button type="button" class="text-button" @click="resetConfig">Restablecer props</button>
        </div>

        <p class="hint config-intro">
          Todas las categorías están desplegadas para comparar y ajustar opciones en una sola vista.
          Las opciones ámbar se aplican al recrear la instancia cuando el modal está cerrado.
        </p>

        <section class="config-section" aria-labelledby="config-identity">
          <h3 id="config-identity">Identidad y presentación</h3>
          <div class="fields">
            <label>id <input v-model="config.id" /></label>
            <label>title <input v-model="config.title" /></label>
            <label>titleTag
              <select v-model="config.titleTag">
                <option>h1</option><option>h2</option><option>h3</option><option>h4</option><option>h5</option><option>h6</option><option>div</option><option>span</option>
              </select>
            </label>
            <label>size
              <select v-model="config.size">
                <option value="">default</option><option>sm</option><option>md</option><option>lg</option><option>xl</option>
              </select>
            </label>
            <label>fullscreen
              <select v-model="config.fullscreen">
                <option :value="false">false</option><option :value="true">true</option>
                <option value="sm">sm-down</option><option value="md">md-down</option><option value="lg">lg-down</option><option value="xl">xl-down</option><option value="xxl">xxl-down</option>
              </select>
            </label>
            <label>icon <input v-model="config.icon" placeholder="info-circle" /></label>
            <label>buttonSize
              <select v-model="config.buttonSize"><option>sm</option><option>md</option><option>lg</option></select>
            </label>
            <label>headerCloseLabel <input v-model="config.headerCloseLabel" /></label>
          </div>
          <h3>Opciones generales</h3>
          <div class="checks">
            <label><input v-model="config.centered" type="checkbox" /> centered</label>
            <label><input v-model="config.movable" type="checkbox" /> movable (Movible)</label>
            <label><input v-model="config.maximizable" type="checkbox" /> maximizable</label>
            <label><input v-model="config.noMinimizable" type="checkbox" /> noMinimizable</label>
            <label><input v-model="config.resizable" type="checkbox" /> resizable</label>
            <label><input v-model="config.scrollable" type="checkbox" /> scrollable</label>
            <label><input v-model="config.allowPageScroll" type="checkbox" />allowPageScroll (scroll del fondo)</label>
            <label><input v-model="config.noFade" type="checkbox" /> noFade</label>
            <label class="requires-recreate"><input v-model="config.noFocus" type="checkbox" /> noFocus</label>
            <label><input v-model="config.titleSrOnly" type="checkbox" /> titleSrOnly</label>
            <label><input v-model="config.headerCloseWhite" type="checkbox" /> headerCloseWhite</label>
            <label><input v-model="config.iconOutlined" type="checkbox" /> iconOutlined</label>
            <label><input v-model="config.iconBorder" type="checkbox" /> iconBorder</label>
          </div>
          <h3>Clases personalizadas</h3>
          <div class="fields">
            <label>modalClass <input v-model="config.modalClass" placeholder="clase-raiz" /></label>
            <label>dialogClass <input v-model="config.dialogClass" placeholder="clase-dialog" /></label>
            <label>contentClass <input v-model="config.contentClass" placeholder="clase-content" /></label>
            <label>titleClass <input v-model="config.titleClass" placeholder="clase-titulo" /></label>
          </div>
        </section>

        <section class="config-section" aria-labelledby="config-sections">
          <h3 id="config-sections">Visibilidad y estilo de secciones</h3>
          <div class="checks">
            <label><input v-model="config.hideHeader" type="checkbox" /> hideHeader</label>
            <label><input v-model="config.hideHeaderClose" type="checkbox" /> hideHeaderClose</label>
            <label><input v-model="config.hideHrHeader" type="checkbox" /> hideHrHeader</label>
            <label><input v-model="config.hideFooter" type="checkbox" /> hideFooter</label>
            <label><input v-model="config.hideHrFooter" type="checkbox" /> hideHrFooter</label>
          </div>
          <h3>Clases de header / body / footer</h3>
          <div class="fields">
            <label>headerClass <input v-model="config.headerClass" /></label>
            <label>bodyClass <input v-model="config.bodyClass" /></label>
            <label>footerClass <input v-model="config.footerClass" /></label>
            <label>headerBgVariant <input v-model="config.headerBgVariant" placeholder="primary" /></label>
            <label>headerTextVariant <input v-model="config.headerTextVariant" placeholder="white" /></label>
            <label>headerBorderVariant <input v-model="config.headerBorderVariant" placeholder="primary" /></label>
            <label>bodyBgVariant <input v-model="config.bodyBgVariant" placeholder="light" /></label>
            <label>bodyTextVariant <input v-model="config.bodyTextVariant" placeholder="dark" /></label>
            <label>footerBgVariant <input v-model="config.footerBgVariant" placeholder="light" /></label>
            <label>footerTextVariant <input v-model="config.footerTextVariant" placeholder="dark" /></label>
            <label>footerBorderVariant <input v-model="config.footerBorderVariant" placeholder="secondary" /></label>
          </div>
        </section>

        <section class="config-section" aria-labelledby="config-buttons">
          <h3 id="config-buttons">Botones y estados</h3>
          <div class="fields">
            <label>okTitle <input v-model="config.okTitle" /></label>
            <label>cancelTitle <input v-model="config.cancelTitle" /></label>
            <label>okVariant <input v-model="config.okVariant" placeholder="primary" /></label>
            <label>cancelVariant <input v-model="config.cancelVariant" placeholder="outline-primary" /></label>
          </div>
          <div class="checks">
            <label><input v-model="config.okOnly" type="checkbox" /> okOnly</label>
            <label><input v-model="config.okDisabled" type="checkbox" /> okDisabled</label>
            <label><input v-model="config.cancelDisabled" type="checkbox" /> cancelDisabled</label>
            <label><input v-model="config.busy" type="checkbox" /> busy</label>
          </div>
          <p class="hint">busy deshabilita ambos botones. okDisabled y cancelDisabled permiten comprobar cada botón por separado. Estos estados sí son reactivos y pueden cambiarse desde los controles internos del modal abierto.</p>
          <div class="actions">
            <button type="button" class="secondary" @click="preventNextOk = !preventNextOk">
              {{ preventNextOk ? 'Desactivar' : 'Activar' }} preventDefault en próximo OK
            </button>
          </div>
          <p class="hint">Al activar esta opción, el listener del evento <code>ok</code> cancela el evento <code>hide</code> y el modal debería permanecer abierto.</p>
        </section>

        <section class="config-section" aria-labelledby="config-behavior">
          <h3 id="config-behavior">Apertura y cierre</h3>
          <div class="checks">
            <label class="requires-recreate"><input v-model="config.hideBackdrop" type="checkbox" /> hideBackdrop</label>
            <label class="requires-recreate"><input v-model="config.noCloseOnBackdrop" type="checkbox" /> noCloseOnBackdrop</label>
            <label class="requires-recreate"><input v-model="config.noCloseOnEsc" type="checkbox" /> noCloseOnEsc</label>
          </div>
          <p class="hint">Probá backdrop normal, estático, oculto y Escape. En este componente, hideBackdrop también activa el cierre externo personalizado.</p>
          <h3>Control imperativo</h3>
          <div class="actions vertical">
            <button type="button" @click="showMain">show()</button>
            <button type="button" class="secondary" @click="hideMain">hide()</button>
            <button type="button" class="secondary" @click="toggleMain">toggle()</button>
            <button type="button" class="secondary" @click="inspectMain">isVisible() / getElement()</button>
          </div>
          <p class="hint">También podés abrir y cerrar mediante el v-model. Bootstrap toma backdrop, keyboard y focus al crear la instancia: cerrá el modal y recrealo desde la tarjeta «Modal principal» después de cambiar esas opciones.</p>
        </section>

        <section class="config-section" aria-labelledby="config-media">
          <h3 id="config-media">Contenido multimedia</h3>
          <div class="checks">
            <label><input v-model="config.multimedia" type="checkbox" /> multimedia</label>
            <label><input v-model="config.slider" type="checkbox" /> slider</label>
          </div>
          <div class="fields">
            <label>Tipo de media
              <select v-model="mediaMode" @change="onMediaModeChange">
                <option value="none">Sin media</option><option value="image">Imagen (string)</option><option value="video">Video (string)</option><option value="object">Objeto</option><option value="array">Array / slider</option>
              </select>
            </label>
            <label>aspectRatio
              <select v-model="config.aspectRatio">
                <option>auto</option><option>16 / 9</option><option>4 / 3</option><option>1 / 1</option><option>9 / 16</option>
              </select>
            </label>
            <label class="wide">URL de imagen/video
              <input v-model="mediaUrl" placeholder="https://..." />
            </label>
            <label>mediaBodyHeight tipo
              <select v-model="mediaHeightMode"><option value="undefined">undefined</option><option value="number">number</option><option value="string">string CSS</option><option value="boolean">boolean true</option></select>
            </label>
            <label>mediaBodyHeight valor <input v-model="mediaHeightValue" placeholder="320 / 20rem" /></label>
          </div>
          <label class="stack">JSON para mediaSrc (objeto o array)
            <textarea v-model="mediaJson" rows="8" spellcheck="false"></textarea>
          </label>
          <p v-if="mediaJsonError" class="error">{{ mediaJsonError }}</p>
          <p v-else class="hint">El JSON debe contener media y, opcionalmente, title, content y subtitles.</p>
          <div class="actions">
            <button type="button" class="secondary" @click="setMediaExample('array')">Ejemplo slider imágenes</button>
            <button type="button" class="secondary" @click="setMediaExample('video')">Ejemplo video + subtítulos</button>
            <button type="button" class="secondary" @click="mediaContentVisible = true">Probar mediaSrc[].content + mediaBodyHeight</button>
            <button type="button" class="secondary" @click="mediaAdaptiveVisible = true">Probar altura adaptativa por página</button>
          </div>
        </section>

        <section class="config-section" aria-labelledby="config-slots">
          <h3 id="config-slots">Slots</h3>
          <div class="checks">
            <label><input v-model="config.customTitleSlot" type="checkbox" /> title</label>
            <label><input v-model="config.customIconSlot" type="checkbox" /> icon</label>
            <label><input v-model="config.customHeaderCloseSlot" type="checkbox" /> header-close</label>
            <label><input v-model="config.customFooterSlot" type="checkbox" /> footer</label>
          </div>
          <p class="hint">El slot por defecto está siempre activo. #title reemplaza el título e impide que se renderice el fallback #icon; desactivá #title para observar #icon. El footer personalizado reemplaza los botones internos por controles propios.</p>
          <label class="stack">Texto de contenido del cuerpo
            <textarea v-model="config.bodyMessage" rows="3"></textarea>
          </label>
        </section>

        <section class="config-section" aria-labelledby="config-programmatic">
          <h3 id="config-programmatic">useEModal</h3>
          <p class="hint">Cada botón ejecuta el composable real desde este componente y registra el resultado de su Promise. Si ya hay un modal abierto, estos controles del fondo quedan bloqueados por el backdrop; el cuerpo del modal principal ofrece los mismos lanzadores para probar aperturas anidadas.</p>
          <div class="actions vertical">
            <button type="button" @click="runAlert">showAlert()</button>
            <button type="button" @click="runConfirm">showConfirm()</button>
            <button type="button" @click="runTextModal">showModal() · string</button>
            <button type="button" @click="runVNodeModal">showModal() · VNode</button>
            <button type="button" @click="runComponentModal">showModal() · Component</button>
            <button type="button" @click="runComponentWithPropsSlots">Component + props + slots</button>
            <button type="button" @click="runFunctionalModal">Functional component</button>
            <button type="button" @click="runContextModal">Componente con inject (AppContext)</button>
            <button type="button" @click="runEmptyContentModal">showModal() · sin contenido</button>
            <button type="button" @click="runCallbacksModal">Callbacks onOk / onCancel / onHidden</button>
            <button type="button" @click="runCustomOptionsModal">showModal() · props adicionales</button>
            <button type="button" class="secondary" @click="runConcurrentModals">Dos modales programáticos simultáneos</button>
            <button type="button" class="secondary" @click="runProgrammaticPreventOk">OK preventDefault (caso de borde)</button>
          </div>
        </section>
      </aside>

      <section class="workspace">
        <article class="panel preview">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">INSTANCIA REAL</p>
              <h2>Modal principal</h2>
              <p class="muted">Abrí el modal y probá sus controles. Sus props se muestran en el inspector; los eventos aparecen en el registro global.</p>
              <p class="hint">
                Por defecto, Bootstrap bloquea la interacción con la página mediante el backdrop.
                El escenario «Ventana flotante: fondo seleccionable» deshabilita ese comportamiento
                y permite interactuar con el contenido exterior al diálogo.
              </p>
            </div>
            <span class="pill" :class="mainVisible ? 'success' : 'neutral'">{{ mainVisible ? 'Abierto' : 'Cerrado' }}</span>
          </div>
          <div class="preview-stage">
            <div class="stage-placeholder">
              <div class="stage-icon">▣</div>
              <strong>EModal</strong>
              <span>La instancia se teletransporta a <code>body</code> al renderizarse.</span>
            </div>
          </div>
          <div class="actions">
            <button type="button" @click="openMain">Abrir modal</button>
            <button type="button" class="secondary" @click="config.modelValue = false">Cerrar por v-model</button>
            <button type="button" class="secondary" @click="toggleMain">Alternar</button>
            <button type="button" class="secondary requires-recreate" :disabled="mainVisible" @click="recreateMainInstance">Recrear instancia principal</button>
          </div>
          <div class="info-grid">
            <div><small>isVisible()</small><b>{{ exposedVisible }}</b></div>
            <div><small>elemento raíz</small><b>{{ elementInfo }}</b></div>
            <div><small>page media</small><b>{{ currentMediaPage }}</b></div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-heading"><div><p class="eyebrow">ESTADO ENVIADO</p><h2>Inspector de props</h2></div><button type="button" class="text-button" @click="copyProps">Copiar JSON</button></div>
          <pre class="code-preview">{{ formattedProps }}</pre>
          <p v-if="mediaJsonError" class="error">La configuración multimedia no es válida y no se envía.</p>
        </article>

        <div class="workspace-divider" role="separator" aria-label="Pruebas complementarias">
          Pruebas complementarias
        </div>

        <article class="panel window-test">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">PRUEBA DE INSTANCIAS</p>
              <h2>Ventanas hermanas y dock</h2>
              <p class="muted">
                Tres EModal comparten la configuración del caso 18 (ventana flotante), más
                allowPageScroll, requisito para minimizar; visibilidad y minimización son independientes.
                Abrí las tres, minimizá cualquiera y probá el bloqueo del dock con un backdrop.
              </p>
            </div>
            <span class="pill" :class="blockingModalVisible ? 'warning' : 'neutral'">
              {{ blockingModalVisible ? 'Backdrop activo' : 'Sin bloqueo' }}
            </span>
          </div>

          <div class="actions">
            <button type="button" @click="openSiblingWindows">Abrir ventana 1, 2 y 3</button>
            <button
              type="button"
              class="secondary"
              :disabled="blockingModalVisible"
              @click="blockingModalVisible = true"
            >
              Abrir modal bloqueador
            </button>
            <button
              type="button"
              class="secondary"
              :disabled="!blockingModalVisible"
              @click="blockingModalVisible = false"
            >
              Cerrar bloqueador
            </button>
            <button type="button" class="secondary" @click="closeSiblingWindows">Cerrar las tres ventanas</button>
          </div>

          <div class="sibling-grid" aria-label="Estado y controles de las ventanas minimizables">
            <section class="sibling-card" aria-labelledby="sibling-one-title">
              <div class="sibling-card__heading">
                <h3 id="sibling-one-title">Ventana 1</h3>
                <span class="pill" :class="siblingStateClass(0)">{{ siblingStateLabel(0) }}</span>
              </div>
              <div class="actions">
                <button type="button" :disabled="siblingWindows[0]" @click="siblingWindows[0] = true">Abrir</button>
                <button type="button" class="secondary" :disabled="!siblingWindows[0] || siblingMinimized[0]" @click="toggleSiblingMinimize(0)">Minimizar</button>
                <button type="button" class="secondary" :disabled="!siblingMinimized[0] || blockingModalVisible" @click="toggleSiblingMinimize(0)">Restaurar al frente</button>
                <button type="button" class="secondary" :disabled="!siblingWindows[0]" @click="siblingWindows[0] = false">Cerrar</button>
              </div>
            </section>
            <section class="sibling-card" aria-labelledby="sibling-two-title">
              <div class="sibling-card__heading">
                <h3 id="sibling-two-title">Ventana 2</h3>
                <span class="pill" :class="siblingStateClass(1)">{{ siblingStateLabel(1) }}</span>
              </div>
              <div class="actions">
                <button type="button" :disabled="siblingWindows[1]" @click="siblingWindows[1] = true">Abrir</button>
                <button type="button" class="secondary" :disabled="!siblingWindows[1] || siblingMinimized[1]" @click="toggleSiblingMinimize(1)">Minimizar</button>
                <button type="button" class="secondary" :disabled="!siblingMinimized[1] || blockingModalVisible" @click="toggleSiblingMinimize(1)">Restaurar al frente</button>
                <button type="button" class="secondary" :disabled="!siblingWindows[1]" @click="siblingWindows[1] = false">Cerrar</button>
              </div>
            </section>
            <section class="sibling-card" aria-labelledby="sibling-three-title">
              <div class="sibling-card__heading">
                <h3 id="sibling-three-title">Ventana 3</h3>
                <span class="pill" :class="siblingStateClass(2)">{{ siblingStateLabel(2) }}</span>
              </div>
              <div class="actions">
                <button type="button" :disabled="siblingWindows[2]" @click="siblingWindows[2] = true">Abrir</button>
                <button type="button" class="secondary" :disabled="!siblingWindows[2] || siblingMinimized[2]" @click="toggleSiblingMinimize(2)">Minimizar</button>
                <button type="button" class="secondary" :disabled="!siblingMinimized[2] || blockingModalVisible" @click="toggleSiblingMinimize(2)">Restaurar al frente</button>
                <button type="button" class="secondary" :disabled="!siblingWindows[2]" @click="siblingWindows[2] = false">Cerrar</button>
              </div>
            </section>
          </div>
          <p class="hint">
            Secuencia sugerida: abrir 1, 2 y 3 → minimizar una o varias → abrir el bloqueador y confirmar
            que el dock queda detrás → cerrar el bloqueador → restaurar una ventana al frente.
            La acción de minimizar/restaurar también está disponible en el encabezado/dock de cada ventana.
          </p>
          <div class="quick-checklist" aria-label="Checklist de cascada, backdrop y dock">
            <strong>Verificación rápida</strong>
            <label v-for="item in windowTestChecklist" :key="item.id">
              <input v-model="checked[item.id]" type="checkbox" />
              <span><b>{{ item.title }}</b><small>{{ item.desc }}</small></span>
            </label>
          </div>
        </article>

        <!-- Prueba de la directiva local v-modal. -->
        <article class="panel">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">DIRECTIVA DEL PLAYGROUND</p>
              <h2>Apertura mediante v-modal</h2>
              <p class="muted">
                Comprueba la apertura de EModal mediante la directiva local,
                sin utilizar referencias ni métodos imperativos.
              </p>
            </div>
          </div>

          <div class="actions">
            <button type="button" class="primary" v-modal.e-modal-lab-directive>
              Abrir mediante v-modal
            </button>
          </div>
          <p class="hint">
            Es una instancia independiente y conserva su configuración propia: por defecto
            tiene backdrop, que puede oscurecer las instancias inferiores, pero debe quedar
            debajo de su propio diálogo.
          </p>
        </article>

        <article class="panel">
          <div class="panel-heading">
            <div><p class="eyebrow">OTRA API DE APERTURA</p><h2>Prop show (compatibilidad)</h2></div>
            <span class="pill" :class="legacyShow ? 'success' : 'neutral'">{{ legacyShow ? 'Abierto' : 'Cerrado' }}</span>
          </div>
          <p class="muted">Instancia aislada que utiliza <code>show</code> en lugar de <code>v-model</code>. Permite verificar su watcher sin mezclar ambos mecanismos.</p>
          <div class="actions">
            <button type="button" @click="legacyShow = true">show = true</button>
            <button type="button" class="secondary" @click="legacyShow = false">show = false</button>
          </div>
        </article>

        <article class="panel cascade">
          <div class="panel-heading">
            <div><p class="eyebrow">PRUEBA PRIORITARIA</p><h2>Modal en cascada</h2><p class="muted">Tres niveles reales, cada uno con su propio v-model y registro de eventos.</p></div>
            <span class="pill" :class="cascadeDepth ? 'success' : 'neutral'">{{ cascadeDepth }} nivel(es) abierto(s)</span>
          </div>
          <div class="cascade-diagram">
            <div :class="{ active: cascade.parent }"><b>01 · Padre</b><span>{{ cascade.parent ? 'Abierto' : 'Cerrado' }}</span></div>
            <div class="connector"></div>
            <div :class="{ active: cascade.child }"><b>02 · Hijo</b><span>{{ cascade.child ? 'Abierto' : 'Cerrado' }}</span></div>
            <div class="connector"></div>
            <div :class="{ active: cascade.grandchild }"><b>03 · Nieto</b><span>{{ cascade.grandchild ? 'Abierto' : 'Cerrado' }}</span></div>
          </div>
          <div class="actions">
            <button type="button" @click="openCascade" :disabled="cascadeDepth > 0">Abrir padre</button>
          </div>
          <div class="checks compact">
            <label class="requires-recreate"><input v-model="cascade.noCloseOnBackdrop" type="checkbox" /> noCloseOnBackdrop en los tres niveles</label>
            <label class="requires-recreate"><input v-model="cascade.hideBackdrop" type="checkbox" /> hideBackdrop en los tres niveles</label>
            <label class="requires-recreate"><input v-model="cascade.noCloseOnEsc" type="checkbox" /> noCloseOnEsc en los tres niveles</label>
            <label class="requires-recreate"><input v-model="cascade.noFocus" type="checkbox" /> noFocus en los tres niveles</label>
            <label><input v-model="cascade.allowPageScroll" type="checkbox" /> allowPageScroll en los tres niveles</label>
            <label><input v-model="cascade.maximizable" type="checkbox" /> maximizable en los tres niveles</label>
            <label><input v-model="cascade.noMinimizable" type="checkbox" /> noMinimizable en los tres niveles</label>
            <label><input v-model="cascade.movable" type="checkbox" /> movable en los tres niveles</label>
          </div>
          <div class="actions">
            <button type="button" class="secondary requires-recreate" @click="recreateCascadeInstances" :disabled="cascadeDepth > 0">Recrear instancias de cascada</button>
          </div>
          <p class="hint">Para interactuar con el fondo, activá hideBackdrop, noFocus y movable: movable aplica la clase que permite que los clics fuera del diálogo lleguen a la página. noCloseOnBackdrop, hideBackdrop, noCloseOnEsc y noFocus se aplican al crear cada instancia: cambialas con la cascada cerrada y recreá. allowPageScroll solo habilita el desplazamiento; maximizable, noMinimizable y movable son reactivos.</p>
        </article>

      </section>
    </div>

    <section class="bottom-grid">
      <article class="panel">
        <div class="panel-heading">
          <div><p class="eyebrow">OBSERVABILIDAD</p><h2>Registro de eventos</h2><p class="muted">Registro global de las instancias y APIs del laboratorio. Más recientes primero; el payload distingue eventos DOM, MouseEvent y CustomEvent.</p></div>
          <div class="actions tight"><span class="pill neutral">{{ eventLog.length }} / {{ maxEvents }}</span><button type="button" class="text-button" @click="clearEventLog">Limpiar</button></div>
        </div>
        <p v-if="eventLog.length === 0" class="empty">Todavía no hay eventos. Abrí una instancia e interactuá con ella.</p>
        <ol v-else class="eventlog">
          <li v-for="item in eventLog" :key="item.id">
            <div class="event-head"><b>{{ item.scope }} · {{ item.name }}</b><time>{{ item.time }}</time></div>
            <pre>{{ item.payload }}</pre>
          </li>
        </ol>
      </article>

      <article class="panel">
        <div class="panel-heading">
          <div><p class="eyebrow">VERIFICACIÓN MANUAL</p><h2>Checklist</h2><p class="muted">Marcá cada caso únicamente después de ejecutarlo y observar el resultado esperado.</p></div>
          <span class="pill neutral">{{ checkedCount }}/{{ checklist.length }}</span>
        </div>
        <div class="progress"><span :style="{ width: `${checklist.length ? checkedCount / checklist.length * 100 : 0}%` }"></span></div>
        <div class="checklist">
          <label v-for="item in checklist" :key="item.id">
            <input v-model="checked[item.id]" type="checkbox" />
            <span><b>{{ item.title }}</b><small>{{ item.desc }}</small></span>
          </label>
        </div>
        <button type="button" class="text-button" @click="clearChecklist">Reiniciar checklist</button>
      </article>
    </section>

    <footer class="disclaimer">
      <b>Alcance:</b> este laboratorio es una herramienta de exploración manual. Las casillas no representan
      resultados automáticos. Debe validarse en escritorio y
      móvil. La cascada debe revisarse también con foco, scroll del body, orden de backdrops y z-index.
      La implementación de Bootstrap Modal no garantiza oficialmente múltiples modales simultáneos; este banco
      comprueba el comportamiento adaptado por EModal en la versión concreta instalada.
    </footer>

    <!-- Modal principal: v-model y API imperativa. -->
    <e-modal
      :key="mainInstanceKey"
      ref="mainModalRef"
      v-bind="modalProps"
      :model-value="config.modelValue"
      @update:model-value="onMainModelUpdate"
      @show="recordEvent('principal', 'show', $event)"
      @shown="recordEvent('principal', 'shown', $event)"
      @hide="recordEvent('principal', 'hide', $event)"
      @hidden="recordEvent('principal', 'hidden', $event)"
      @hide-prevented="recordEvent('principal', 'hide-prevented', $event)"
      @ok="onMainOk"
      @cancel="recordEvent('principal', 'cancel', $event)"
      @click-outside="recordEvent('principal', 'click-outside', $event)"
    >
      <template v-if="config.customTitleSlot" #title>
        <span class="e-modal-lab__slot-title">Título personalizado desde #title</span>
      </template>
      <template v-if="config.customIconSlot" #icon>
        <span class="e-modal-lab__slot-icon" aria-label="Icono de ejemplo">✦</span>
      </template>
      <template v-if="config.customHeaderCloseSlot" #header-close>
        <span class="e-modal-lab__slot-close">Cerrar</span>
      </template>
      <div class="e-modal-lab__content">
        <p><b>Contenido del slot default.</b></p>
        <p>{{ config.bodyMessage }}</p>

        <div class="e-modal-lab__state">
          <span>modelValue:</span><b>{{ config.modelValue }}</b>
          <span>movable:</span><b>{{ config.movable }}</b>
          <span>maximizable:</span><b>{{ config.maximizable }}</b>
          <span>resizable:</span><b>{{ config.resizable }}</b>
          <span>busy:</span><b>{{ config.busy }}</b>
          <span>OK deshabilitado:</span><b>{{ config.okDisabled }}</b>
          <span>Cancelar deshabilitado:</span><b>{{ config.cancelDisabled }}</b>
          <span>isVisible():</span><b>{{ exposedVisible }}</b>
          <span>Elemento:</span><b>{{ elementInfo }}</b>
        </div>

        <section class="e-modal-lab__tools">
          <strong>Controles disponibles con el modal abierto</strong>
          <div class="e-modal-lab__actions">
            <button type="button" class="btn btn-sm btn-outline-primary" @click="config.busy = !config.busy">{{ config.busy ? 'Quitar busy' : 'Activar busy' }}</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="config.okDisabled = !config.okDisabled">{{ config.okDisabled ? 'Habilitar OK' : 'Deshabilitar OK' }}</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="config.cancelDisabled = !config.cancelDisabled">{{ config.cancelDisabled ? 'Habilitar Cancelar' : 'Deshabilitar Cancelar' }}</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="armPreventNextOk">Probar OK con preventDefault</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="inspectMain">Inspeccionar instancia</button>
            <button type="button" class="btn btn-sm btn-outline-danger" @click="hideMain">hide()</button>
            <button type="button" class="btn btn-sm btn-outline-danger" @click="toggleMain">toggle()</button>
          </div>
        </section>

        <section class="e-modal-lab__tools">
          <strong>Probar useEModal desde un modal ya abierto</strong>
          <div class="e-modal-lab__actions">
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runAlert">showAlert()</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runConfirm">showConfirm()</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runTextModal">showModal() · string</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runVNodeModal">showModal() · VNode</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runComponentModal">showModal() · Component</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runComponentWithPropsSlots">Component + props + slots</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runFunctionalModal">Componente funcional</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runContextModal">Componente con inject</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runEmptyContentModal">Sin contenido</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runCallbacksModal">Callbacks onOk / onCancel / onHidden</button>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="runCustomOptionsModal">Props adicionales</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="runProgrammaticPreventOk">Promise + preventDefault</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="runConcurrentModals">Dos modales programáticos simultáneos</button>
          </div>
        </section>

        <section v-if="eventLog.length" class="e-modal-lab__recent-events">
          <strong>Últimos eventos observados</strong>
          <ol>
            <li v-for="item in eventLog.slice(0, 4)" :key="item.id">
              <b>{{ item.scope }} · {{ item.name }}</b>
              <pre>{{ item.payload }}</pre>
            </li>
          </ol>
        </section>
      </div>
      <template v-if="config.customFooterSlot" #footer>
        <div class="e-modal-lab__footer">
          <span>Footer reemplazado por slot</span>
          <button type="button" class="btn btn-outline-secondary" @click="hideMain">Cerrar desde slot</button>
        </div>
      </template>
    </e-modal>

    <!-- Dos ventanas hermanas comparten el caso minimizable, pero no el estado. -->
    <e-modal
      ref="siblingOneRef"
      id="e-modal-lab-sibling-one"
      v-model="siblingWindows[0]"
      v-bind="siblingWindowProps"
      title="Ventana minimizable 1"
      @show="recordEvent('ventana-1', 'show', $event)"
      @shown="observeSiblingState(0)"
      @hide="recordEvent('ventana-1', 'hide', $event)"
      @hidden="onSiblingHidden(0)"
    >
      <p>Primera instancia minimizable. Su visibilidad y estado no dependen de la ventana 2.</p>
      <button type="button" class="btn btn-outline-secondary" @click="siblingWindows[0] = false">Cerrar ventana 1</button>
    </e-modal>

    <e-modal
      ref="siblingTwoRef"
      id="e-modal-lab-sibling-two"
      v-model="siblingWindows[1]"
      v-bind="siblingWindowProps"
      title="Ventana minimizable 2"
      @show="recordEvent('ventana-2', 'show', $event)"
      @shown="observeSiblingState(1)"
      @hide="recordEvent('ventana-2', 'hide', $event)"
      @hidden="onSiblingHidden(1)"
    >
      <p>Segunda instancia minimizable. Minimizar, restaurar o cerrar esta ventana no modifica la 1.</p>
      <button type="button" class="btn btn-outline-secondary" @click="siblingWindows[1] = false">Cerrar ventana 2</button>
    </e-modal>

    <e-modal
      ref="siblingThreeRef"
      id="e-modal-lab-sibling-three"
      v-model="siblingWindows[2]"
      v-bind="siblingWindowProps"
      title="Ventana minimizable 3"
      @show="recordEvent('ventana-3', 'show', $event)"
      @shown="observeSiblingState(2)"
      @hide="recordEvent('ventana-3', 'hide', $event)"
      @hidden="onSiblingHidden(2)"
    >
      <p>Tercera instancia minimizable. Su visibilidad y estado no dependen de las ventanas 1 y 2.</p>
      <button type="button" class="btn btn-outline-secondary" @click="siblingWindows[2] = false">Cerrar ventana 3</button>
    </e-modal>

    <e-modal
      id="e-modal-lab-dock-blocker"
      v-model="blockingModalVisible"
      title="Modal bloqueador del dock"
      size="sm"
      @show="recordEvent('bloqueador-dock', 'show', $event)"
      @shown="recordEvent('bloqueador-dock', 'shown', $event)"
      @hide="recordEvent('bloqueador-dock', 'hide', $event)"
      @hidden="recordEvent('bloqueador-dock', 'hidden', $event)"
    >
      <p>Este modal tiene backdrop. Cerralo para comprobar que el dock vuelva a estar accesible.</p>
      <button type="button" class="btn btn-primary" @click="blockingModalVisible = false">Cerrar y habilitar el dock</button>
    </e-modal>

    <!-- Instancia separada para comprobar la prop show. -->
    <e-modal
      id="e-modal-lab-show-prop"
      :show="legacyShow"
      title="Apertura mediante prop show"
      @show="recordEvent('show-prop', 'show', $event)"
      @shown="recordEvent('show-prop', 'shown', $event)"
      @hide="recordEvent('show-prop', 'hide', $event)"
      @hidden="onLegacyHidden"
      @update:model-value="onLegacyModelUpdate"
      @cancel="recordEvent('show-prop', 'cancel', $event)"
      @ok="recordEvent('show-prop', 'ok', $event)"
    >
      <p>Esta instancia se abre y cierra cambiando exclusivamente la prop <code>show</code>.</p>
      <p>Comprobá que su ciclo no altere el modelo de la instancia principal.</p>
      <button type="button" class="btn btn-outline-secondary" @click="legacyShow = false">Cerrar desde el contenido</button>
    </e-modal>

    <!-- Instancia independiente para probar la directiva v-modal. -->
    <e-modal
      id="e-modal-lab-directive"
      title="Apertura mediante directiva"
      size="md"
      @show="recordEvent('directiva', 'show', $event)"
      @shown="recordEvent('directiva', 'shown', $event)"
      @hide="recordEvent('directiva', 'hide', $event)"
      @hidden="recordEvent('directiva', 'hidden', $event)"
      @update:model-value="recordEvent('directiva', 'update:modelValue', $event)"
    >
      <p>
        Este modal fue abierto mediante la directiva
        <code>v-modal.e-modal-lab-directive</code>.
      </p>

      <p>
        No se utilizó ref, show() ni modelValue para solicitar su apertura.
      </p>

      <button
        type="button"
        class="btn btn-outline-secondary"
        data-bs-dismiss="modal"
      >
        Cerrar
      </button>
    </e-modal>

    <!--
      Prueba específica del contenido multimedia.
      No se proporciona slot default: EModal debe mostrar currentPage.content.
      mediaBodyHeight=true debe igualar la altura del body según el contenido mayor.
    -->
    <e-modal
      id="e-modal-lab-media-content"
      v-model="mediaContentVisible"
      title="Contenido proveniente de mediaSrc"
      size="lg"
      :multimedia="true"
      :slider="true"
      :media-body-height="true"
      :media-src="mediaContentItems"
      aspect-ratio="16 / 9"
      @update:model-value="recordEvent('media-content', 'update:modelValue', $event)"
      @show="recordEvent('media-content', 'show', $event)"
      @shown="recordEvent('media-content', 'shown', $event)"
      @hide="recordEvent('media-content', 'hide', $event)"
      @hidden="recordEvent('media-content', 'hidden', $event)"
      @click-outside="recordEvent('media-content', 'click-outside', $event)"
    />

    <!--
      Prueba de altura adaptativa.
      No se especifica mediaBodyHeight: cada página utiliza su altura natural.
      No se proporciona slot default para utilizar currentPage.content.
    -->
    <e-modal
      id="e-modal-lab-media-adaptive"
      v-model="mediaAdaptiveVisible"
      title="Altura adaptativa por página"
      size="lg"
      :multimedia="true"
      :slider="true"
      :media-src="mediaContentItems"
      aspect-ratio="16 / 9"
      @update:model-value="recordEvent('media-adaptive', 'update:modelValue', $event)"
      @show="recordEvent('media-adaptive', 'show', $event)"
      @shown="recordEvent('media-adaptive', 'shown', $event)"
      @hide="recordEvent('media-adaptive', 'hide', $event)"
      @hidden="recordEvent('media-adaptive', 'hidden', $event)"
    />

    <!-- Cascada de tres niveles; cada modal conserva su propio modelo y eventos. -->
    <e-modal
      :key="cascadeInstanceKey"
      id="e-modal-lab-cascade-parent"
      v-model="cascade.parent"
      title="Nivel 1 · Modal padre"
      size="lg"
      :no-close-on-backdrop="cascade.noCloseOnBackdrop"
      :hide-backdrop="cascade.hideBackdrop"
      :no-close-on-esc="cascade.noCloseOnEsc"
      :no-focus="cascade.noFocus"
      :allow-page-scroll="cascade.allowPageScroll"
      :maximizable="cascade.maximizable"
      :no-minimizable="cascade.noMinimizable"
      :movable="cascade.movable"
      @update:model-value="recordCascade('padre', 'update:modelValue', $event)"
      @show="recordCascade('padre', 'show', $event)"
      @shown="recordCascade('padre', 'shown', $event)"
      @hide="recordCascade('padre', 'hide', $event)"
      @hidden="recordCascade('padre', 'hidden', $event)"
      @hide-prevented="recordCascade('padre', 'hide-prevented', $event)"
      @ok="recordCascade('padre', 'ok', $event)"
      @cancel="recordCascade('padre', 'cancel', $event)"
      @click-outside="recordCascade('padre', 'click-outside', $event)"
    >
      <div class="e-modal-lab__cascade-body">
        <p>Este es el primer nivel. El hijo se renderiza como descendiente Vue, pero EModal lo teletransporta a <code>body</code>.</p>
        <div class="e-modal-lab__state"><b>Padre:</b><span>{{ cascade.parent }}</span><b>Hijo:</b><span>{{ cascade.child }}</span></div>
        <button type="button" class="btn btn-primary" @click="cascade.child = true">Abrir modal hijo</button>
        <button type="button" class="btn btn-outline-secondary" @click="cascade.parent = false">Cerrar solamente padre</button>
        <button type="button" class="btn btn-outline-danger" @click="closeCascade">Cerrar los tres niveles</button>
        <button type="button" class="btn btn-outline-primary" @click="runAlert">Abrir showAlert sobre la cascada</button>
        <button type="button" class="btn btn-link" @click="recordCascade('padre', 'interacción de contenido', 'El padre recibió el clic.')">Registrar interacción del padre</button>
        <div v-if="eventLog.length" class="e-modal-lab__recent-events">
          <strong>Últimos eventos de la cascada</strong>
          <ol>
            <li v-for="item in eventLog.filter(item => item.scope.startsWith('cascada/')).slice(0, 3)" :key="item.id">
              <b>{{ item.scope }} · {{ item.name }}</b><pre>{{ item.payload }}</pre>
            </li>
          </ol>
        </div>
      </div>
      <e-modal
        id="e-modal-lab-cascade-child"
        v-model="cascade.child"
        title="Nivel 2 · Modal hijo"
        size="md"
        :no-close-on-backdrop="cascade.noCloseOnBackdrop"
        :hide-backdrop="cascade.hideBackdrop"
        :no-close-on-esc="cascade.noCloseOnEsc"
        :no-focus="cascade.noFocus"
        :allow-page-scroll="cascade.allowPageScroll"
        :maximizable="cascade.maximizable"
        :no-minimizable="cascade.noMinimizable"
        :movable="cascade.movable"
        @update:model-value="recordCascade('hijo', 'update:modelValue', $event)"
        @show="recordCascade('hijo', 'show', $event)"
        @shown="recordCascade('hijo', 'shown', $event)"
        @hide="recordCascade('hijo', 'hide', $event)"
        @hidden="recordCascade('hijo', 'hidden', $event)"
        @hide-prevented="recordCascade('hijo', 'hide-prevented', $event)"
        @ok="recordCascade('hijo', 'ok', $event)"
        @cancel="recordCascade('hijo', 'cancel', $event)"
        @click-outside="recordCascade('hijo', 'click-outside', $event)"
      >
        <div class="e-modal-lab__cascade-body">
          <p>Segundo nivel. Interactuá aquí: el padre debe permanecer abierto.</p>
          <div class="e-modal-lab__state"><b>Padre:</b><span>{{ cascade.parent }}</span><b>Hijo:</b><span>{{ cascade.child }}</span><b>Nieto:</b><span>{{ cascade.grandchild }}</span></div>
          <div v-if="eventLog.length" class="e-modal-lab__recent-events">
            <strong>Eventos recientes</strong>
            <ol>
              <li v-for="item in eventLog.filter(item => item.scope.startsWith('cascada/')).slice(0, 3)" :key="item.id">
                <b>{{ item.scope }} · {{ item.name }}</b><pre>{{ item.payload }}</pre>
              </li>
            </ol>
          </div>
          <button type="button" class="btn btn-primary" @click="cascade.grandchild = true">Abrir modal nieto</button>
          <button type="button" class="btn btn-outline-secondary" @click="cascade.child = false">Cerrar solamente hijo</button>
          <button type="button" class="btn btn-outline-warning" @click="cascade.parent = false">Cerrar solamente padre</button>
          <button type="button" class="btn btn-outline-danger" @click="closeCascade">Cerrar los tres niveles</button>
          <button type="button" class="btn btn-outline-primary" @click="runConfirm">Abrir showConfirm sobre el hijo</button>
          <button type="button" class="btn btn-link" @click="recordCascade('hijo', 'interacción de contenido', 'El hijo recibió el clic; el padre debe seguir abierto.')">Registrar interacción del hijo</button>
        </div>
        <e-modal
          id="e-modal-lab-cascade-grandchild"
          v-model="cascade.grandchild"
          title="Nivel 3 · Modal nieto"
          size="sm"
          :no-close-on-backdrop="cascade.noCloseOnBackdrop"
          :hide-backdrop="cascade.hideBackdrop"
          :no-close-on-esc="cascade.noCloseOnEsc"
          :no-focus="cascade.noFocus"
          :allow-page-scroll="cascade.allowPageScroll"
          :maximizable="cascade.maximizable"
          :no-minimizable="cascade.noMinimizable"
          :movable="cascade.movable"
          @update:model-value="recordCascade('nieto', 'update:modelValue', $event)"
          @show="recordCascade('nieto', 'show', $event)"
          @shown="recordCascade('nieto', 'shown', $event)"
          @hide="recordCascade('nieto', 'hide', $event)"
          @hidden="recordCascade('nieto', 'hidden', $event)"
          @hide-prevented="recordCascade('nieto', 'hide-prevented', $event)"
          @ok="recordCascade('nieto', 'ok', $event)"
          @cancel="recordCascade('nieto', 'cancel', $event)"
          @click-outside="recordCascade('nieto', 'click-outside', $event)"
        >
          <div class="e-modal-lab__cascade-body">
            <p>Tercer nivel. Cerrá este modal y comprobá que los otros dos sigan visibles.</p>
            <div class="e-modal-lab__state"><b>Padre:</b><span>{{ cascade.parent }}</span><b>Hijo:</b><span>{{ cascade.child }}</span><b>Nieto:</b><span>{{ cascade.grandchild }}</span></div>
            <div v-if="eventLog.length" class="e-modal-lab__recent-events">
              <strong>Eventos recientes</strong>
              <ol>
                <li v-for="item in eventLog.filter(item => item.scope.startsWith('cascada/')).slice(0, 3)" :key="item.id">
                  <b>{{ item.scope }} · {{ item.name }}</b><pre>{{ item.payload }}</pre>
                </li>
              </ol>
            </div>
            <button type="button" class="btn btn-outline-secondary" @click="cascade.grandchild = false">Cerrar solamente nieto</button>
            <button type="button" class="btn btn-outline-warning" @click="cascade.child = false">Cerrar solamente hijo</button>
            <button type="button" class="btn btn-outline-warning" @click="cascade.parent = false">Cerrar solamente padre</button>
            <button type="button" class="btn btn-outline-danger" @click="closeCascade">Cerrar los tres niveles</button>
            <button type="button" class="btn btn-outline-primary" @click="runTextModal">Abrir showModal sobre el nieto</button>
            <button type="button" class="btn btn-link" @click="recordCascade('nieto', 'interacción de contenido', 'El nieto recibió el clic; los otros niveles deben seguir abiertos.')">Registrar interacción del nieto</button>
          </div>
        </e-modal>
      </e-modal>
    </e-modal>

  </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, inject, nextTick, onBeforeUnmount, reactive, ref } from 'vue';
import type { PropType, Slots, VNode } from 'vue';
import EModal from '../components/EModal.vue';
import { useEModal } from '../composables/useEModal';
import vModal from './vModal';

/* --------------------------------------------------------------------------
 * Componentes auxiliares para probar ModalContent
 * -------------------------------------------------------------------------- */
const ProgrammaticContent = defineComponent({
  name: 'EModalLabProgrammaticContent',
  props: {
    message: { type: String, default: 'Contenido renderizado como componente.' },
    onOpenNested: { type: Function as PropType<() => void>, default: undefined },
  },
  setup(props, { slots }) {
    return () => h('div', { class: 'e-modal-lab__programmatic' }, [
      h('p', props.message),
      ...(slots.default?.() ?? []),
      ...(slots.extra?.() ?? []),
      h('small', 'Este nodo pertenece a un componente Vue real.'),
      props.onOpenNested
        ? h('button', {
          type: 'button',
          class: 'btn btn-outline-primary',
          onClick: props.onOpenNested,
        }, 'Abrir otro modal programático desde este componente')
        : null,
    ]);
  },
});

const FunctionalContent = (props: { message?: string }) => h(
  'div',
  { class: 'e-modal-lab__programmatic' },
  [h('strong', 'Componente funcional'), h('p', props.message || 'Contenido funcional')]
);

const AppContextContent = defineComponent({
  name: 'EModalLabAppContextContent',
  setup() {
    const value = inject('emodal-lab-context', 'El playground no define emodal-lab-context.');
    return () => h('div', { class: 'e-modal-lab__programmatic' }, [
      h('p', 'Este componente intenta leer un provide del contexto de la aplicación.'),
      h('pre', String(value)),
    ]);
  },
});

/* --------------------------------------------------------------------------
 * Estado y configuración inicial
 * -------------------------------------------------------------------------- */
function baseConfig() {
  return {
    id: 'e-modal-lab-main',
    title: 'Modal de prueba',
    titleTag: 'h5',
    size: 'lg',
    fullscreen: false as boolean | string,
    centered: true,
    movable: false,
    maximizable: false,
    noMinimizable: false,
    resizable: false,
    scrollable: false,
    allowPageScroll: false,
    noFade: false,
    noFocus: false,
    titleSrOnly: false,
    icon: '',
    buttonSize: 'md' as const,
    headerCloseLabel: 'Cerrar modal',
    headerCloseWhite: false,
    iconOutlined: false,
    iconBorder: false,
    modalClass: '',
    dialogClass: '',
    contentClass: '',
    titleClass: '',
    hideHeader: false,
    hideHeaderClose: false,
    hideHrHeader: false,
    hideFooter: false,
    hideHrFooter: false,
    headerClass: '',
    bodyClass: '',
    footerClass: '',
    headerBgVariant: '',
    headerTextVariant: '',
    headerBorderVariant: '',
    bodyBgVariant: '',
    bodyTextVariant: '',
    footerBgVariant: '',
    footerTextVariant: '',
    footerBorderVariant: '',
    okTitle: 'Aceptar',
    cancelTitle: 'Cancelar',
    okVariant: 'primary',
    cancelVariant: 'outline-primary',
    okOnly: false,
    okDisabled: false,
    cancelDisabled: false,
    busy: false,
    hideBackdrop: false,
    noCloseOnBackdrop: false,
    noCloseOnEsc: false,
    multimedia: false,
    slider: false,
    aspectRatio: 'auto',
    mediaBodyHeight: undefined as number | string | boolean | undefined,
    customTitleSlot: false,
    customIconSlot: false,
    customHeaderCloseSlot: false,
    customFooterSlot: false,
    bodyMessage: 'Este contenido pertenece al slot default. Podés cambiar las propiedades desde el panel de la izquierda.',
    modelValue: false,
  };
}

const config = reactive(baseConfig());
const preset = ref('default');
const legacyShow = ref(false);
/**
 * API pública expuesta por EModal mediante defineExpose().
 * La instancia expone esta API imperativa además de los eventos Vue.
 */
interface EModalPublicInstance {
  show(): void;
  hide(): void;
  toggle(): void;
  isVisible(): boolean;
  getElement(): HTMLElement | undefined;
}

const mainModalRef = ref<EModalPublicInstance | null>(null);
const mainInstanceKey = ref(0);
const siblingOneRef = ref<EModalPublicInstance | null>(null);
const siblingTwoRef = ref<EModalPublicInstance | null>(null);
const siblingThreeRef = ref<EModalPublicInstance | null>(null);
const siblingWindows = ref([false, false, false]);
const siblingMinimized = ref([false, false, false]);
const blockingModalVisible = ref(false);
const siblingWindowProps = {
  size: 'md',
  centered: true,
  movable: true,
  hideBackdrop: true,
  noCloseOnBackdrop: true,
  noFocus: true,
  allowPageScroll: true,
  noMinimizable: false,
};
const siblingObservers: Array<MutationObserver | undefined> = [];
const exposedVisible = ref(false);
const elementInfo = ref('No consultado');
const preventNextOk = ref(false);
const eventLog = ref<Array<{ id: number; scope: string; name: string; time: string; payload: string }>>([]);
const maxEvents = 150;
let eventCounter = 0;

const mediaMode = ref<'none' | 'image' | 'video' | 'object' | 'array'>('none');
const defaultMediaUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const defaultMediaJson = '[\n  { "media": "https://placehold.co/900x500/png?text=Imagen+1", "title": "Primera imagen", "content": "Descripción de la primera imagen" },\n  { "media": "https://placehold.co/900x500/png?text=Imagen+2", "title": "Segunda imagen", "content": "Descripción de la segunda imagen" }\n]';
const mediaUrl = ref(defaultMediaUrl);
const mediaJson = ref(defaultMediaJson);
const mediaHeightMode = ref('undefined');
const mediaHeightValue = ref('320');

function baseCascadeConfig() {
  return {
    parent: false,
    child: false,
    grandchild: false,
    noCloseOnBackdrop: true,
    hideBackdrop: true,
    noCloseOnEsc: true,
    noFocus: true,
    allowPageScroll: true,
    maximizable: true,
    noMinimizable: false,
    movable: true,
  };
}

const cascade = reactive(baseCascadeConfig());
const cascadeInstanceKey = ref(0);

const presets = [
  { id: 'default', label: '01 · Modal estándar' },
  { id: 'minimal', label: '02 · Sin header / footer' },
  { id: 'fullscreen', label: '03 · Pantalla completa' },
  { id: 'scroll', label: '04 · Contenido extenso y scroll' },
  { id: 'busy', label: '05 · busy / botones deshabilitados' },
  { id: 'ok-only', label: '06 · okOnly' },
  { id: 'no-backdrop', label: '07 · hideBackdrop' },
  { id: 'static-backdrop', label: '08 · noCloseOnBackdrop' },
  { id: 'no-esc', label: '09 · noCloseOnEsc' },
  { id: 'no-fade', label: '10 · noFade / noFocus' },
  { id: 'slots', label: '11 · Slots personalizados' },
  { id: 'image', label: '12 · Multimedia: imagen' },
  { id: 'video', label: '13 · Multimedia: video' },
  { id: 'slider', label: '14 · Multimedia: slider' },
  { id: 'cascade', label: '15 · Cascada de tres niveles' },
  { id: 'image-md', label: '16 · Multimedia MD: imagen simple' },
  { id: 'slider-lg', label: '17 · Multimedia LG: slider' },
  { id: 'background-selectable', label: '18 · Ventana flotante sin backdrop y fondo seleccionable' },
  { id: 'maximizable', label: '19 · Maximizar / restaurar' },
  { id: 'maximizable-movable', label: '20 · Maximizar + movable' },
  { id: 'fullscreen-restorable', label: '21 · Fullscreen restaurable' },
  { id: 'resizable-sm', label: '22 · Resizable SM' },
  { id: 'resizable-md', label: '23 · Resizable MD' },
  { id: 'resizable-movable', label: '24 · Resizable + movable' },
  { id: 'resizable-maximizable', label: '25 · Resizable + maximizable + movable' },
  { id: 'resizable-scrollable', label: '26 · Resizable + scrollable' },
  { id: 'resizable-floating', label: '27 · Ventana flotante redimensionable' },
  { id: 'page-scroll', label: '28 · allowPageScroll' },
  { id: 'page-scroll-resizable', label: '29 · allowPageScroll + resizable' },
  { id: 'page-scroll-maximizable', label: '30 · allowPageScroll + maximizable' },
  { id: 'minimizable-window', label: '31 · Ventana minimizable' },
];

/* --------------------------------------------------------------------------
 * Multimedia y propiedades enviadas al componente
 * -------------------------------------------------------------------------- */
type MediaItem = {
  media: string;
  title?: string;
  content?: string;
  subtitles?: string;
};

const sampleImageOne = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500"><rect width="100%" height="100%" fill="#e8eef5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="42" fill="#315b85">EModal · Imagen 1</text></svg>')}`;
const sampleImageTwo = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500"><rect width="100%" height="100%" fill="#e6f2ec"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="42" fill="#287653">EModal · Imagen 2</text></svg>')}`;

/* --------------------------------------------------------------------------
 * Datos para probar mediaSrc[].content sin slot default
 * -------------------------------------------------------------------------- */

const mediaContentVisible = ref(false);
const mediaAdaptiveVisible = ref(false);

const mediaContentItems: MediaItem[] = [
  {
    media: sampleImageOne,
    title: 'Primera página',
    content: 'Contenido corto. Esta página tiene poco texto.',
  },
  {
    media: sampleImageTwo,
    title: 'Segunda página',
    content: 'Contenido extenso. '.repeat(100),
  },
  {
    media: sampleImageOne,
    title: 'Tercera página',
    content: 'Contenido de longitud intermedia. '.repeat(25),
  },
];

function parseMediaJson(): MediaItem | MediaItem[] | null {
  if (!mediaJson.value.trim()) return null;
  try {
    return JSON.parse(mediaJson.value) as MediaItem | MediaItem[];
  } catch {
    return null;
  }
}

const mediaJsonError = computed(() => {
  if (mediaMode.value !== 'object' && mediaMode.value !== 'array') return '';
  let value: unknown;
  try {
    value = JSON.parse(mediaJson.value);
  } catch (error) {
    return `JSON inválido: ${(error as Error).message}`;
  }

  if (mediaMode.value === 'object') {
    if (!value || Array.isArray(value) || typeof value !== 'object' || typeof (value as { media?: unknown }).media !== 'string') {
      return 'Estructura inválida: se espera un objeto con media de tipo string.';
    }
  }

  if (mediaMode.value === 'array') {
    if (!Array.isArray(value) || value.some(item => !item || typeof item.media !== 'string')) {
      return 'Estructura inválida: se espera un array de objetos con media de tipo string.';
    }
  }

  return '';
});

const mediaSrc = computed<string | MediaItem | MediaItem[]>(() => {
  if (mediaMode.value === 'none') return '';

  if (mediaMode.value === 'image' || mediaMode.value === 'video') {
    return mediaUrl.value;
  }

  if (mediaJsonError.value) return '';

  return parseMediaJson() ?? '';
});

const mediaBodyHeight = computed(() => {
  if (mediaHeightMode.value === 'number') {
    const value = Number(mediaHeightValue.value);
    return Number.isFinite(value) ? value : undefined;
  }
  if (mediaHeightMode.value === 'string') return mediaHeightValue.value;
  if (mediaHeightMode.value === 'boolean') return true;
  return undefined;
});

const modalProps = computed(() => ({
  id: config.id,
  title: config.title,
  titleTag: config.titleTag,
  size: config.size || undefined,
  fullscreen: config.fullscreen,
  centered: config.centered,
  movable: config.movable,
  maximizable: config.maximizable,
  noMinimizable: config.noMinimizable,
  resizable: config.resizable,
  scrollable: config.scrollable,
  allowPageScroll: config.allowPageScroll,
  noFade: config.noFade,
  noFocus: config.noFocus,
  titleSrOnly: config.titleSrOnly,
  icon: config.icon || undefined,
  buttonSize: config.buttonSize,
  headerCloseLabel: config.headerCloseLabel,
  headerCloseWhite: config.headerCloseWhite,
  iconOutlined: config.iconOutlined,
  iconBorder: config.iconBorder,
  modalClass: config.modalClass || undefined,
  dialogClass: config.dialogClass || undefined,
  contentClass: config.contentClass || undefined,
  titleClass: config.titleClass || undefined,
  hideHeader: config.hideHeader,
  hideHeaderClose: config.hideHeaderClose,
  hideHrHeader: config.hideHrHeader,
  hideFooter: config.hideFooter,
  hideHrFooter: config.hideHrFooter,
  headerClass: config.headerClass || undefined,
  bodyClass: config.bodyClass || undefined,
  footerClass: config.footerClass || undefined,
  headerBgVariant: config.headerBgVariant || undefined,
  headerTextVariant: config.headerTextVariant || undefined,
  headerBorderVariant: config.headerBorderVariant || undefined,
  bodyBgVariant: config.bodyBgVariant || undefined,
  bodyTextVariant: config.bodyTextVariant || undefined,
  footerBgVariant: config.footerBgVariant || undefined,
  footerTextVariant: config.footerTextVariant || undefined,
  footerBorderVariant: config.footerBorderVariant || undefined,
  okTitle: config.okTitle,
  cancelTitle: config.cancelTitle,
  okVariant: config.okVariant,
  cancelVariant: config.cancelVariant,
  okOnly: config.okOnly,
  okDisabled: config.okDisabled,
  cancelDisabled: config.cancelDisabled,
  busy: config.busy,
  hideBackdrop: config.hideBackdrop,
  noCloseOnBackdrop: config.noCloseOnBackdrop,
  noCloseOnEsc: config.noCloseOnEsc,
  multimedia: config.multimedia,
  slider: config.slider,
  aspectRatio: config.aspectRatio,
  mediaBodyHeight: mediaBodyHeight.value,
  mediaSrc: mediaSrc.value,
}));

const formattedProps = computed(() => JSON.stringify({
  ...modalProps.value,
  modelValue: config.modelValue,
}, (_key, value) => value === undefined ? '[undefined]' : value, 2));

const mainVisible = computed(() => config.modelValue || exposedVisible.value);
const currentMediaPage = computed(() => {
  if (mediaMode.value === 'array' && Array.isArray(mediaSrc.value)) return `${mediaSrc.value.length} elementos`;
  return mediaMode.value;
});

function getSiblingRef(index: number) {
  return [siblingOneRef.value, siblingTwoRef.value, siblingThreeRef.value][index];
}

function siblingStateLabel(index: number) {
  if (!siblingWindows.value[index]) return 'Cerrada';
  return siblingMinimized.value[index] ? 'Minimizada' : 'Visible';
}

function siblingStateClass(index: number) {
  if (!siblingWindows.value[index]) return 'neutral';
  return siblingMinimized.value[index] ? 'warning' : 'success';
}

async function openSiblingWindows() {
  siblingWindows.value[0] = true;
  await nextTick();
  siblingWindows.value[1] = true;
  await nextTick();
  siblingWindows.value[2] = true;
  await nextTick();
  recordEvent('ventanas-hermanas', 'secuencia de apertura', 'Ventanas 1, 2 y 3');
}

function toggleSiblingMinimize(index: number) {
  const minimizeButton = getSiblingRef(index)
    ?.getElement()
    ?.querySelector<HTMLButtonElement>('.e-modal__minimize');
  if (!minimizeButton) {
    recordEvent(`ventana-${index + 1}`, 'acción de minimizar no disponible', 'Abrí la instancia y verificá que cumpla los requisitos de minimización.');
    return;
  }
  minimizeButton.click();
}

function closeSiblingWindows() {
  siblingWindows.value = [false, false, false];
}

async function observeSiblingState(index: number) {
  await nextTick();
  const element = getSiblingRef(index)?.getElement();
  if (!element) return;
  siblingObservers[index]?.disconnect();
  const updateMinimized = () => {
    siblingMinimized.value[index] = element.classList.contains('e-modal--minimized');
  };
  updateMinimized();
  siblingObservers[index] = new MutationObserver(updateMinimized);
  siblingObservers[index]?.observe(element, { attributes: true, attributeFilter: ['class'] });
}

function onSiblingHidden(index: number) {
  siblingObservers[index]?.disconnect();
  siblingObservers[index] = undefined;
  siblingMinimized.value[index] = false;
  recordEvent(`ventana-${index + 1}`, 'hidden');
}

onBeforeUnmount(() => siblingObservers.forEach(observer => observer?.disconnect()));

/* --------------------------------------------------------------------------
 * Registro de eventos
 * -------------------------------------------------------------------------- */
function getPayloadFallback(payload: unknown): string {
  if (payload instanceof Error) {
    return `${payload.name}: ${payload.message}`;
  }

  if (typeof payload === 'function') {
    return `[Function ${payload.name || 'anonymous'}]`;
  }

  if (typeof payload === 'symbol') {
    return `[Symbol ${payload.description || ''}]`;
  }

  if (typeof payload === 'bigint') {
    return `${payload.toString()}n`;
  }

  return '[Payload no serializable]';
}

function serializePayload(payload: unknown): string {
  if (payload === undefined) return 'undefined';
  if (payload === null) return 'null';
  if (payload instanceof Event) {
    const target = payload.target instanceof HTMLElement
      ? (payload.target.id || payload.target.className || payload.target.tagName)
      : null;
    const result: Record<string, unknown> = {
      constructor: payload.constructor.name,
      type: payload.type,
      cancelable: payload.cancelable,
      defaultPrevented: payload.defaultPrevented,
      isTrusted: payload.isTrusted,
      target,
      timeStamp: Math.round(payload.timeStamp),
    };
    if (payload instanceof MouseEvent) {
      result.button = payload.button;
      result.clientX = payload.clientX;
      result.clientY = payload.clientY;
    }
    if (payload instanceof CustomEvent) result.detail = payload.detail;
    return JSON.stringify(result, null, 2);
  }

  try {
    return JSON.stringify(payload, (_key, value) => {
      if (value instanceof HTMLElement) return `[HTMLElement ${value.id || value.tagName}]`;
      if (value instanceof Event) return `[Event ${value.type}]`;
      return value;
    }, 2) ?? getPayloadFallback(payload);
  } catch {
    return getPayloadFallback(payload);
  }
}

function recordEvent(scope: string, name: string, payload?: unknown) {
  eventCounter += 1;
  eventLog.value.unshift({
    id: eventCounter,
    scope,
    name,
    time: new Date().toLocaleTimeString(),
    payload: serializePayload(payload),
  });
  if (eventLog.value.length > maxEvents) eventLog.value.length = maxEvents;
}

function recordCascade(scope: string, name: string, payload?: unknown) {
  recordEvent(`cascada/${scope}`, name, payload);
}

function clearEventLog() {
  eventLog.value = [];
}

function onMainModelUpdate(value: boolean) {
  config.modelValue = value;
  exposedVisible.value = value;
  recordEvent('principal', 'update:modelValue', value);
}

function armPreventNextOk() {
  preventNextOk.value = true;
  recordEvent('principal', 'preventDefault preparado', 'El próximo evento ok será cancelado para impedir el cierre.');
}

function onMainOk(event: Event) {
  recordEvent('principal', 'ok', event);
  if (preventNextOk.value) {
    event.preventDefault();
    preventNextOk.value = false;
    recordEvent('principal', 'preventDefault aplicado al evento ok', { defaultPrevented: event.defaultPrevented });
  }
}

function onLegacyModelUpdate(value: boolean) {
  legacyShow.value = value;
  recordEvent('show-prop', 'update:modelValue', value);
}

function onLegacyHidden(event?: Event) {
  recordEvent('show-prop', 'hidden', event);
}

/* --------------------------------------------------------------------------
 * Métodos de la instancia principal
 * -------------------------------------------------------------------------- */
function openMain() {
  config.modelValue = true;
}

function showMain() {
  mainModalRef.value?.show();
}

function recreateMainInstance() {
  if (mainVisible.value) return;
  mainInstanceKey.value += 1;
  exposedVisible.value = false;
  elementInfo.value = 'No consultado';
  recordEvent('principal', 'instancia recreada', 'Se aplican las opciones de inicialización de Bootstrap.');
}

function hideMain() {
  mainModalRef.value?.hide();
}

function toggleMain() {
  mainModalRef.value?.toggle();
}

function inspectMain() {
  exposedVisible.value = mainModalRef.value?.isVisible() ?? false;
  const element = mainModalRef.value?.getElement();
  elementInfo.value = element
    ? `${element.tagName.toLowerCase()}#${element.id} · z-index ${getComputedStyle(element).zIndex}`
    : 'No disponible';
  recordEvent('principal', 'inspección API expuesta', {
    isVisible: exposedVisible.value,
    element: element ? { id: element.id, className: element.className, zIndex: getComputedStyle(element).zIndex } : null,
  });
}

function copyProps() {
  navigator.clipboard?.writeText(formattedProps.value).then(
    () => recordEvent('laboratorio', 'props copiadas', 'JSON copiado al portapapeles'),
    error => recordEvent('laboratorio', 'error al copiar props', String(error)),
  );
}

/* --------------------------------------------------------------------------
 * Escenarios prearmados
 * -------------------------------------------------------------------------- */
function resetConfig() {
  Object.assign(config, baseConfig());
  if (!mainVisible.value) {
    mainInstanceKey.value += 1;
  }
  mediaMode.value = 'none';
  mediaUrl.value = defaultMediaUrl;
  mediaJson.value = defaultMediaJson;
  mediaHeightMode.value = 'undefined';
  mediaHeightValue.value = '320';
  preventNextOk.value = false;
}

function resetLab() {
  resetConfig();
  legacyShow.value = false;
  closeCascade();
  Object.assign(cascade, baseCascadeConfig());
  cascadeInstanceKey.value += 1;
  preset.value = 'default';
  siblingWindows.value = [false, false, false];
  siblingMinimized.value = [false, false, false];
  blockingModalVisible.value = false;
  clearEventLog();
  checked.value = {};
  recordEvent('laboratorio', 'reset', 'Laboratorio restablecido');
}

function applyPreset(id: string) {
  resetConfig();
  switch (id) {
    case 'minimal':
      config.hideHeader = true;
      config.hideFooter = true;
      break;
    case 'fullscreen':
      config.fullscreen = true;
      config.centered = false;
      break;
    case 'scroll':
      config.scrollable = true;
      config.bodyMessage = 'Contenido extenso para probar el scroll del modal.\n\n'.repeat(18);
      break;
    case 'busy':
      config.busy = true;
      break;
    case 'ok-only':
      config.okOnly = true;
      break;
    case 'no-backdrop':
      config.hideBackdrop = true;
      break;
    case 'background-selectable':
      config.title = 'Ventana flotante';
      config.size = 'md';
      config.movable = true;
      config.centered = true;
      config.hideBackdrop = true;
      config.noCloseOnBackdrop = true;
      config.noFocus = true;
      break;
    case 'static-backdrop':
      config.noCloseOnBackdrop = true;
      break;
    case 'no-esc':
      config.noCloseOnEsc = true;
      break;
    case 'no-fade':
      config.noFade = true;
      config.noFocus = true;
      break;
    case 'slots':
      config.customIconSlot = true;
      config.customHeaderCloseSlot = true;
      config.customFooterSlot = true;
      break;
    case 'image':
      config.multimedia = true;
      mediaMode.value = 'image';
      mediaUrl.value = sampleImageOne;
      config.aspectRatio = '16 / 9';
      break;
    case 'video':
      config.multimedia = true;
      mediaMode.value = 'video';
      config.aspectRatio = '16 / 9';
      break;
    case 'slider':
      config.multimedia = true;
      config.slider = true;
      mediaMode.value = 'array';
      setMediaExample('array');
      break;
    case 'image-md':
      config.multimedia = true;
      config.slider = false;
      config.size = 'md';
      config.aspectRatio = '16 / 9';
      mediaMode.value = 'image';
      mediaUrl.value = sampleImageOne;
      break;
    case 'slider-lg':
      config.multimedia = true;
      config.slider = true;
      config.size = 'lg';
      config.aspectRatio = '16 / 9';
      mediaMode.value = 'array';
      setMediaExample('array');
      break;
    case 'cascade':
      openCascade();
      break;
    case 'maximizable':
      config.size = 'lg';
      config.maximizable = true;
      break;
    case 'maximizable-movable':
      config.size = 'md';
      config.maximizable = true;
      config.movable = true;
      break;
    case 'fullscreen-restorable':
      config.size = 'lg';
      config.fullscreen = true;
      config.maximizable = true;
      break;
    case 'resizable-sm':
      config.size = 'sm';
      config.resizable = true;
      break;
    case 'resizable-md':
      config.size = 'md';
      config.resizable = true;
      break;
    case 'resizable-movable':
      config.size = 'md';
      config.resizable = true;
      config.movable = true;
      break;
    case 'resizable-maximizable':
      config.size = 'lg';
      config.resizable = true;
      config.maximizable = true;
      config.movable = true;
      break;
    case 'resizable-scrollable':
      config.size = 'lg';
      config.resizable = true;
      config.scrollable = true;
      config.bodyMessage = 'Contenido extenso para probar el scroll interno mientras se redimensiona la ventana.\n\n'.repeat(18);
      break;
    case 'resizable-floating':
      config.title = 'Ventana flotante redimensionable';
      config.size = 'md';
      config.resizable = true;
      config.movable = true;
      config.hideBackdrop = true;
      config.noCloseOnBackdrop = true;
      config.noFocus = true;
      break;
    case 'page-scroll':
      config.title = 'Página desplazable';
      config.size = 'md';
      config.movable = true;
      config.hideBackdrop = true;
      config.noCloseOnBackdrop = true;
      config.noFocus = true;
      config.allowPageScroll = true;
      break;
    case 'minimizable-window':
      config.title = 'Ventana minimizable';
      config.size = 'md';
      config.hideBackdrop = true;
      config.noCloseOnBackdrop = true;
      config.noFocus = true;
      config.allowPageScroll = true;
      break;
    case 'page-scroll-resizable':
      config.title = 'Página desplazable + ventana redimensionable';
      config.size = 'md';
      config.movable = true;
      config.resizable = true;
      config.hideBackdrop = true;
      config.noCloseOnBackdrop = true;
      config.noFocus = true;
      config.allowPageScroll = true;
      break;
    case 'page-scroll-maximizable':
      config.title = 'Página desplazable + maximización';
      config.size = 'md';
      config.movable = true;
      config.maximizable = true;
      config.hideBackdrop = true;
      config.noCloseOnBackdrop = true;
      config.noFocus = true;
      config.allowPageScroll = true;
      break;
    default:
      break;
  }
  recordEvent('laboratorio', 'preset aplicado', id);
}

function onMediaModeChange() {
  if (mediaMode.value === 'image') {
    mediaUrl.value = sampleImageOne;
    config.multimedia = true;
    config.slider = false;
  } else if (mediaMode.value === 'video') {
    mediaUrl.value = defaultMediaUrl;
    config.multimedia = true;
    config.slider = false;
  } else if (mediaMode.value === 'array') {
    setMediaExample('array');
  } else if (mediaMode.value === 'object') {
    setMediaExample('video');
  }
}

function setMediaExample(type: 'array' | 'video') {
  if (type === 'array') {
    mediaMode.value = 'array';
    config.multimedia = true;
    config.slider = true;
    mediaJson.value = JSON.stringify([
      { media: sampleImageOne, title: 'Primera imagen', content: 'Contenido de la primera página' },
      { media: sampleImageTwo, title: 'Segunda imagen', content: 'Contenido de la segunda página' },
      { media: sampleImageOne, title: 'Tercera imagen', content: 'Contenido de la tercera página' },
    ], null, 2);
  } else {
    mediaUrl.value = defaultMediaUrl;
    mediaMode.value = 'object';
    config.multimedia = true;
    config.slider = false;
    mediaJson.value = JSON.stringify({
      media: mediaUrl.value,
      title: 'Video de prueba',
      content: 'Descripción del video',
      subtitles: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.vtt',
    }, null, 2);
  }
}

/* --------------------------------------------------------------------------
 * Cascada de tres niveles
 * -------------------------------------------------------------------------- */
const cascadeDepth = computed(() => Number(cascade.parent) + Number(cascade.child) + Number(cascade.grandchild));

function openCascade() {
  cascade.grandchild = false;
  cascade.child = false;
  cascade.parent = true;
}

function closeCascade() {
  cascade.grandchild = false;
  cascade.child = false;
  cascade.parent = false;
}

function recreateCascadeInstances() {
  if (cascadeDepth.value > 0) return;

  cascadeInstanceKey.value += 1;
  recordEvent('cascada', 'instancias recreadas', 'Se aplicaron las opciones Bootstrap actuales.');
}

/* --------------------------------------------------------------------------
 * useEModal: alert, confirm, contenido y escenarios concurrentes
 * -------------------------------------------------------------------------- */
const modalApi = useEModal();

function trackPromise(label: string, promise: Promise<boolean>): void {
  recordEvent('useEModal', `${label} iniciada`, 'Esperando resolución de la Promise');

  void promise.then(
    result => recordEvent('useEModal', `${label} resuelta`, {
      result,
      meaning: result ? 'aceptado' : 'cancelado/cerrado',
    }),
    error => recordEvent('useEModal', `${label} rechazada`, {
      message: error instanceof Error ? error.message : String(error),
    }),
  );
}

function runAlert() {
  trackPromise('showAlert', modalApi.showAlert('Alerta programática', 'Este modal fue abierto mediante showAlert().'));
}

function runConfirm() {
  trackPromise('showConfirm', modalApi.showConfirm('Confirmación programática', '¿Confirmás la operación?'));
}

function runTextModal() {
  trackPromise('showModal string', modalApi.showModal({
    title: 'Contenido string',
    content: 'El composable acepta texto plano como contenido del body.',
    size: 'md',
    centered: true,
  }));
}

function runVNodeModal() {
  const content: VNode = h('div', { class: 'e-modal-lab__programmatic' }, [
    h('h4', 'Contenido VNode'),
    h('p', 'Este contenido se creó con h() y se entregó como VNode.'),
    h('code', 'isVNode(content) === true'),
  ]);
  trackPromise('showModal VNode', modalApi.showModal({ title: 'Contenido VNode', content }));
}

function runComponentModal() {
  trackPromise('showModal Component', modalApi.showModal({
    title: 'Contenido Component',
    content: ProgrammaticContent,
    size: 'lg',
  }));
}

function runComponentWithPropsSlots() {
  const slots = {
    default: () => [h('strong', 'Slot default recibido por el componente dinámico.')],
    extra: () => [h('p', { class: 'e-modal-lab__slot-extra' }, 'Slot nombrado: extra.')],
  } as unknown as Slots;

  trackPromise('Component + props + slots', modalApi.showModal({
    title: 'Componente con props y slots',
    content: {
      component: ProgrammaticContent,
      props: {
        message: 'La prop message fue enviada mediante ModalContentOptions.',
        onOpenNested: () => runAlert(),
      },
      slots,
    },
  }));
}

function runFunctionalModal() {
  trackPromise('Functional component', modalApi.showModal({
    title: 'Componente funcional',
    content: FunctionalContent,
    size: 'sm',
  }));
}

function runContextModal() {
  trackPromise('AppContext / inject', modalApi.showModal({
    title: 'Contexto de aplicación',
    content: AppContextContent,
  }));
}

function runEmptyContentModal() {
  trackPromise('showModal sin contenido', modalApi.showModal({
    title: 'Modal sin contenido',
    size: 'sm',
  }));
}

function runCallbacksModal() {
  trackPromise('Callbacks completos', modalApi.showModal({
    title: 'Callbacks del composable',
    content: 'Probá Aceptar, Cancelar, X y cierre externo. Revisá qué callbacks se ejecutan y en qué orden.',
    onOk: event => recordEvent('useEModal callback', 'onOk', event),
    onCancel: event => recordEvent('useEModal callback', 'onCancel', event),
    onHidden: event => recordEvent('useEModal callback', 'onHidden', event),
  }));
}

function runCustomOptionsModal() {
  trackPromise('showModal props adicionales', modalApi.showModal({
    title: 'Opciones adicionales',
    content: 'Esta instancia prueba propiedades adicionales reenviadas a EModal mediante el spread de opciones.',
    size: 'lg',
    centered: false,
    scrollable: true,
    fullscreen: false,
    okVariant: 'success',
    cancelVariant: 'outline-secondary',
    okTitle: 'Confirmar operación',
    cancelTitle: 'Volver',
    headerBgVariant: 'light',
    bodyBgVariant: 'white',
    noCloseOnBackdrop: true,
    noCloseOnEsc: true,
  }));
}

function runConcurrentModals() {
  const first = modalApi.showConfirm('Primera instancia', 'Este es el primer modal programático.', { size: 'lg' });
  const second = modalApi.showAlert('Segunda instancia', 'Este modal se abre sin esperar el cierre del primero.', { size: 'sm' });
  trackPromise('Modal concurrente A', first);
  trackPromise('Modal concurrente B', second);
}

function runProgrammaticPreventOk() {
  trackPromise('OK preventDefault programático', modalApi.showModal({
    title: 'OK con preventDefault',
    content: 'El callback onOk cancela el evento hide. Observá si la Promise queda resuelta aunque el modal siga abierto.',
    onOk: event => {
      event.preventDefault();
      recordEvent('useEModal', 'onOk ejecutó preventDefault()', { defaultPrevented: event.defaultPrevented });
    },
    onHidden: event => recordEvent('useEModal', 'onHidden callback', event),
  }));
}

/* --------------------------------------------------------------------------
 * Checklist manual
 * -------------------------------------------------------------------------- */
const checklist = [
  { id: 'model', title: 'Apertura/cierre con v-model', desc: 'true, false y actualización desde el componente.' },
  { id: 'show', title: 'Prop show independiente', desc: 'Abrir/cerrar la instancia aislada mediante show.' },
  { id: 'methods', title: 'Métodos expuestos', desc: 'show, hide, toggle, isVisible y getElement.' },
  { id: 'size', title: 'Tamaños', desc: 'default, sm, md, lg y xl según estilos disponibles.' },
  { id: 'fullscreen', title: 'Fullscreen', desc: 'Boolean y breakpoints sm/md/lg/xl/xxl.' },
  { id: 'maximizable', title: 'Maximizar y restaurar', desc: 'Alternancia fullscreen, conservación del tamaño y posición anteriores.' },
  { id: 'header-double-click', title: 'Doble clic en el header', desc: 'Maximizar/restaurar con maximizable activo; el botón debe estar disponible y los controles del header no deben dispararlo.' },
  { id: 'maximizable-movable', title: 'Maximizar con movable', desc: 'Arrastrar, maximizar y recuperar exactamente la posición anterior.' },
  { id: 'fullscreen-restorable', title: 'Restaurar fullscreen inicial', desc: 'fullscreen=true y maximizable=true; restauración a size configurado.' },
  { id: 'resizable-sm', title: 'Redimensionar modal SM', desc: 'Controlador nativo, tamaño inicial pequeño y límites mínimos.' },
  { id: 'resizable-md', title: 'Redimensionar modal MD', desc: 'Modificar ancho y alto desde la esquina inferior derecha.' },
  { id: 'resizable-movable', title: 'Redimensionar y mover', desc: 'Redimensionar, desplazar y comprobar que ambas operaciones conservan la geometría.' },
  { id: 'resizable-maximizable', title: 'Redimensionar, maximizar y restaurar', desc: 'Conservar tamaño y posición personalizados al alternar fullscreen.' },
  { id: 'resizable-scrollable', title: 'Redimensionar con scroll interno', desc: 'Comprobar el scroll del body y evitar scrollbars duplicados.' },
  { id: 'resizable-floating', title: 'Ventana flotante redimensionable', desc: 'Redimensionar sin backdrop y seguir interactuando con la página de fondo.' },
  { id: 'resizable-minimum', title: 'Límites mínimos', desc: 'Intentar reducir la ventana por debajo de 280 × 160 px.' },
  { id: 'resizable-viewport', title: 'Límites del viewport', desc: 'Comprobar que la ventana no crezca fuera del área visible.' },
  { id: 'resizable-disabled', title: 'Resizing deshabilitado', desc: 'resizable=false no muestra el controlador ni altera el modal tradicional.' },
  { id: 'center-scroll', title: 'Centrado y scroll', desc: 'centered y scrollable con contenido largo.' },
  { id: 'header', title: 'Header', desc: 'hideHeader, hideHeaderClose, separador, titleTag, titleSrOnly, icon y variantes del cierre.' },
  { id: 'icon-style', title: 'Icono y cierre', desc: 'iconOutlined, iconBorder y headerCloseWhite con un icon válido.' },
  { id: 'body-footer', title: 'Body y footer', desc: 'visibilidad, separadores, variantes y clases.' },
  { id: 'classes', title: 'Clases personalizadas', desc: 'modalClass, dialogClass, contentClass, titleClass, headerClass, bodyClass y footerClass.' },
  { id: 'slots', title: 'Slots', desc: 'title, icon, header-close, footer y default.' },
  { id: 'buttons', title: 'Botones', desc: 'okOnly, variantes, tamaños, disabled y busy.' },
  { id: 'ok', title: 'Aceptar', desc: 'Evento ok, hide cancelable y preventDefault.' },
  { id: 'cancel', title: 'Cancelar', desc: 'Footer, X, cierre multimedia y evento cancel.' },
  { id: 'backdrop', title: 'Backdrop normal', desc: 'Clic fuera y evento click-outside.' },
  { id: 'static-backdrop', title: 'Backdrop estático', desc: 'noCloseOnBackdrop y hide-prevented.' },
  { id: 'hide-backdrop', title: 'Sin backdrop', desc: 'hideBackdrop y cierre por clic externo propio.' },
  { id: 'escape', title: 'Tecla Escape', desc: 'noCloseOnEsc true y false.' },
  { id: 'focus', title: 'Foco', desc: 'noFocus y retorno/limpieza de foco.' },
  { id: 'fade', title: 'Transiciones', desc: 'noFade y transiciones nativas Bootstrap.' },
  { id: 'image', title: 'Imagen multimedia', desc: 'Extensiones, data URI, alt y aspectRatio.' },
  { id: 'video', title: 'Video multimedia', desc: 'MP4/WebM/OGV/MOV/M4V y subtítulos.' },
  { id: 'slider', title: 'Slider multimedia', desc: 'Array de medios, navegación y límites.' },
  { id: 'media-update', title: 'Cambio de mediaSrc', desc: 'Reemplazar array y comprobar que vuelve a página 1.' },
  { id: 'media-height', title: 'mediaBodyHeight', desc: 'number, string CSS y cálculo booleano con array.' },
  { id: 'events', title: 'Eventos y payloads', desc: 'show, shown, hide, hidden, hide-prevented, ok, cancel, click-outside.' },
  { id: 'cascade-2', title: 'Cascada padre/hijo', desc: 'Abrir ambos e interactuar con el hijo sin cerrar el padre.' },
  { id: 'cascade-3', title: 'Cascada de tres niveles', desc: 'Nieto cierra sin afectar padre ni hijo.' },
  { id: 'cascade-close', title: 'Cerrar niveles en orden', desc: 'Nieto, hijo y padre; backdrops y z-index se recuperan.' },
  { id: 'cascade-backdrop', title: 'Backdrop en cascada', desc: 'Cerrar niveles superiores y comprobar el traspaso fluido del backdrop al nivel inferior.' },
  { id: 'cascade-backdrop-click', title: 'Clic en backdrop aislado', desc: 'Con dos modales abiertos, el clic en el backdrop cierra solo la instancia superior; la inferior sigue abierta. Repetir con noCloseOnBackdrop.' },
  { id: 'cascade-minimize-restore', title: 'Dock bloqueado por backdrop', desc: 'Minimizar una ventana y abrir un modal con backdrop: el dock queda detrás y no permite restaurarla. Al cerrar el modal, el dock vuelve a ser accesible; restaurar lleva la ventana al frente.' },
  { id: 'cascade-scroll-backdrop-owner', title: 'Scroll según dueño del backdrop', desc: 'Con instancias abiertas con allowPageScroll opuestos, prevalece la configuración del modal dueño del backdrop visible. Minimizar la instancia inferior no cambia el resultado.' },
  { id: 'cascade-focus', title: 'Foco y scroll en cascada', desc: 'Verificar foco, body.modal-open y scroll.' },
  { id: 'cascade-unmount', title: 'Desmontaje con modales abiertos', desc: 'Cambiar de vista/cerrar la vista de laboratorio.' },
  { id: 'alert', title: 'showAlert', desc: 'Promise true al aceptar; false ante otro cierre.' },
  { id: 'confirm', title: 'showConfirm', desc: 'Promise true al aceptar y false al cancelar.' },
  { id: 'string-content', title: 'Contenido string programático', desc: 'Texto plano en body.' },
  { id: 'vnode-content', title: 'Contenido VNode', desc: 'VNode creado previamente.' },
  { id: 'component-content', title: 'Contenido Component', desc: 'Componente Vue simple o funcional.' },
  { id: 'component-options', title: 'Component + props + slots', desc: 'ModalContentOptions y slots nombrados renderizados por el componente.' },
  { id: 'app-context', title: 'Contexto de aplicación', desc: 'El componente dinámico puede leer un app.provide si la aplicación lo define.' },
  { id: 'empty-content', title: 'Contenido omitido', desc: 'showModal sin content.' },
  { id: 'extra-props', title: 'Props adicionales', desc: 'Propiedades específicas de EModal reenviadas mediante OpenModalOptions.' },
  { id: 'callbacks', title: 'Callbacks del composable', desc: 'onOk, onCancel y onHidden.' },
  { id: 'promise-hidden', title: 'Resolución por cierre externo', desc: 'Backdrop, Escape o X deben resolver false al finalizar hidden.' },
  { id: 'concurrent', title: 'Modales programáticos concurrentes', desc: 'Abrir dos llamadas sin esperar una a otra.' },
  { id: 'cleanup', title: 'Limpieza programática', desc: 'Contenedor eliminado después de hidden.' },
  { id: 'prevent-ok-promise', title: 'OK preventDefault y Promise', desc: 'Verificar si Promise y vida del modal quedan sincronizadas.' },
  { id: 'page-scroll-enabled', title: 'Scroll de página habilitado', desc: 'allowPageScroll=true permite desplazar el documento con el modal abierto.' },
  { id: 'page-scroll-resizable', title: 'Scroll independiente de resizable', desc: 'Cambiar resizable entre true y false no debe alterar allowPageScroll.' },
  { id: 'page-scroll-fullscreen', title: 'Scroll y maximización', desc: 'Maximizar bloquea el scroll de página; restaurar vuelve a permitirlo.' },
  { id: 'page-scroll-cascade', title: 'Scroll en cascada', desc: 'Comprobar la coordinación cuando hay varios modales con distintos valores de allowPageScroll.' },
];

const checked = ref<Record<string, boolean>>({});
const checkedCount = computed(() => Object.values(checked.value).filter(Boolean).length);
const windowTestChecklist = computed(() => checklist.filter(item => [
  'cascade-backdrop-click',
  'cascade-minimize-restore',
  'cascade-scroll-backdrop-owner',
].includes(item.id)));

function clearChecklist() {
  checked.value = {};
}
</script>

<style lang="scss">
  @use "./eda-lab";
</style>
<style lang="scss" scoped>
  .config-intro { margin: 0 0 16px; }
  .controls .config-section { padding-top: 16px; border-top: 1px solid #e6ebf0; }
  .controls .config-section + .config-section { margin-top: 18px; }
  .controls .config-section > h3:first-child { margin-top: 0; }
  .controls .config-section > h3:not(:first-child) { margin-top: 22px; }

  .workspace-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--lab-muted);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .workspace-divider::before,
  .workspace-divider::after { content: ""; flex: 1; border-top: 1px solid var(--lab-line); }

  .window-test { border-color: #9eb4cb; }
  .sibling-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .sibling-card { min-width: 0; padding: 12px; border: 1px solid var(--lab-line); border-radius: 8px; background: #f8fafc; }
  .sibling-card__heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
  .sibling-card h3 { margin: 0; font-size: 15px; }
  .sibling-card .actions { margin: 0; gap: 6px; }
  .sibling-card .actions button { padding: 7px 9px; }
  .quick-checklist { display: grid; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #e6ebf0; }
  .quick-checklist > strong { font-size: 14px; }
  .quick-checklist label { display: flex; align-items: flex-start; gap: 9px; margin: 0; }
  .quick-checklist input { flex: 0 0 auto; width: 18px; height: 18px; margin: 2px 0 0; accent-color: var(--lab-primary); }
  .quick-checklist span { display: grid; gap: 2px; min-width: 0; }
  .quick-checklist b { font-size: 13px; }
  .quick-checklist small { color: var(--lab-muted); line-height: 1.4; }
  .pill.warning { background: #fff2d6; color: #825a05; }

  /* Modal preview */
  .preview-stage { min-height: 220px; border: 1px dashed #ccd7e3; border-radius: 9px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); display: grid; place-items: center; }
  .stage-placeholder { display: flex; flex-direction: column; align-items: center; gap: 7px; color: #75869a; text-align: center; }
  .stage-placeholder strong { color: #34485f; font-size: 17px; }
  .stage-placeholder span { font-size: 12px; }
  .stage-icon { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid #cbd7e3; border-radius: 12px; background: #fff; color: var(--lab-primary); font-size: 22px; }

  /* Instance information */
  .info-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; margin-top: 14px; }
  .info-grid div { display: flex; flex-direction: column; gap: 4px; padding: 10px; background: var(--lab-soft); border-radius: 7px; min-width: 0; }
  .info-grid small { color: var(--lab-muted); font-size: 12px; }
  .info-grid b { overflow-wrap: anywhere; font-size: 14px; }

  /* Props inspector */
  .code-preview { max-height: 300px; overflow: auto; padding: 12px; border-radius: 8px; color: #d9e5f2; background: #1d2b3b; font-size: 12px; line-height: 1.5; }

  /* Nested modal diagram */
  .cascade { border-color: #bdcad8; }
  .cascade-diagram { display: flex; align-items: center; justify-content: center; gap: 7px; margin: 15px 0; }
  .cascade-diagram > div:not(.connector) { display: flex; flex-direction: column; gap: 4px; padding: 10px 13px; border: 1px solid var(--lab-line); border-radius: 8px; background: #f7f9fb; min-width: 100px; }
  .cascade-diagram > div.active { background: #e8f3ed; border-color: #8bc7a8; }
  .cascade-diagram b { font-size: 14px; }
  .cascade-diagram span { color: var(--lab-muted); font-size: 12px; }
  .connector { width: 22px; height: 1px; background: #aab8c8; }

  @media (max-width: 460px) {
    .info-grid { grid-template-columns: 1fr; }
    .sibling-grid { grid-template-columns: 1fr; }
    .cascade-diagram { gap: 4px; }
    .cascade-diagram > div:not(.connector) { min-width: 0; padding: 8px; }
    .connector { width: 10px; }
  }
</style>
<!--
  EModal teletransporta su contenido a body.
  Estos estilos deben ser globales y solo afectan las clases propias del laboratorio.
-->
<style lang="scss">
  .e-modal .e-modal-lab__content { display: flex; flex-direction: column; gap: 12px; }
  .e-modal .e-modal-lab__content p { margin: 0; }
  .e-modal .e-modal-lab__state { display: flex; flex-wrap: wrap; gap: 6px 10px; background: #f2f5f8; border-radius: 6px; padding: 8px; font-size: 14px; }
  .e-modal .e-modal-lab__tools { display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid #dce3eb; border-radius: 7px; background: #f8fafc; }
  .e-modal .e-modal-lab__tools > strong { font-size: 14px; }
  .e-modal .e-modal-lab__actions { display: flex; flex-wrap: wrap; gap: 7px; }
  .e-modal .e-modal-lab__recent-events { border-top: 1px solid #e4e9ef; padding-top: 10px; }
  .e-modal .e-modal-lab__recent-events > strong { font-size: 14px; }
  .e-modal .e-modal-lab__recent-events ol { margin: 8px 0 0; padding-left: 20px; }
  .e-modal .e-modal-lab__recent-events li { margin: 7px 0; font-size: 12px; }
  .e-modal .e-modal-lab__recent-events pre { margin: 3px 0 0; padding: 6px; max-height: 90px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; background: #f3f6f9; border-radius: 5px; font-size: 12px; }
  .e-modal .e-modal-lab__footer { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .e-modal .e-modal-lab__slot-title { color: var(--bs-primary); }
  .e-modal .e-modal-lab__slot-icon { font-size: 34px; color: var(--bs-primary); }
  .e-modal .e-modal-lab__slot-close { font-size: 12px; }
  .e-modal .e-modal-lab__programmatic { padding: 5px; }
  .e-modal .e-modal-lab__programmatic p { margin: 8px 0; }
  .e-modal .e-modal-lab__slot-extra { color: var(--bs-primary); }
  .e-modal .e-modal-lab__cascade-body { display: flex; flex-direction: column; gap: 10px; }
  .e-modal .e-modal-lab__cascade-body p { margin: 0; }

  @media (max-width: 460px) {
    .e-modal .e-modal-lab__footer { align-items: flex-start; flex-direction: column; }
    .e-modal .e-modal-lab__actions > button { max-width: 100%; white-space: normal; }
  }
</style>