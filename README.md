# EModal

Standalone Vue 3 modal component, extracted from EDA/Vue for independent development.

This project is authorized for community sharing and is being prepared for its
first release. It has not yet been published to a package registry.

## Requirements

- Node.js 22.12 or newer
- Vue 3.5 or newer
- Bootstrap 5.3 CSS
- `@vueuse/core` 15 or newer

The package provides its own EModal styles and control icons. Bootstrap's
stylesheet must be loaded by the consuming application. Custom icon names use
Material Symbols Rounded and require that font to be loaded by the application.

The package exports both `EModal` and `useEModal` from its root entry. The
composable can open alert, confirmation, and content modals from a Vue component:

```ts
import { useEModal } from "emodal-vue";

const { showAlert, showConfirm, showModal } = useEModal();
```

Import the component styles alongside Bootstrap:

```ts
import "bootstrap/dist/css/bootstrap.min.css";
import "emodal-vue/style.css";
```

## Development

```sh
npm install
npm run dev
npm run typecheck
npm run build
```

`npm run dev` opens the interactive EModal laboratory at the local Vite URL.
The playground keeps its `v-modal` directive local; it is not exported by the package.

## License

MIT. See [LICENSE](./LICENSE).
