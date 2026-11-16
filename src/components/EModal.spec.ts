import { createApp, nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import EModal from "./EModal.vue";

function renderModal(props: Record<string, unknown> = {}) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const app = createApp(EModal, props);
  app.mount(host);

  return {
    unmount() {
      app.unmount();
      host.remove();
    },
  };
}

describe("EModal standalone package", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the title and default actions", () => {
    const app = renderModal({
      noFade: true,
      title: "Confirmation",
    });

    const modal = document.body.querySelector(".e-modal");

    expect(modal?.querySelector(".modal-title")?.textContent).toContain(
      "Confirmation"
    );
    expect(modal?.querySelector('[id$="_btnCancel"]')).not.toBeNull();
    expect(modal?.querySelector('[id$="_btnOK"]')).not.toBeNull();

    app.unmount();
  });

  it("navigates media pages with its local paginator", async () => {
    const app = renderModal({
      mediaSrc: [
        { media: "first.png", content: "First page" },
        { media: "second.png", content: "Second page" },
      ],
      slider: true,
    });

    expect(document.body.textContent).toContain("First page");
    document.body.querySelector<HTMLButtonElement>(
      ".e-paginator button[aria-label='Next page']"
    )?.click();
    await nextTick();

    expect(document.body.textContent).toContain("Second page");
    app.unmount();
  });

  it("opens through v-model using Bootstrap's modal instance", async () => {
    const app = renderModal({
      hideBackdrop: true,
      modelValue: true,
      noFade: true,
      noFocus: true,
    });

    await nextTick();

    expect(document.body.querySelector(".e-modal")?.classList.contains("show"))
      .toBe(true);

    app.unmount();
  });
});
