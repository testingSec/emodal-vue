import { createApp, defineComponent, nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { useEModal } from "./useEModal";

describe("useEModal", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("resolves an alert and removes its generated modal", async () => {
    let showAlert: ReturnType<typeof useEModal>["showAlert"] | undefined;
    const caller = defineComponent({
      setup() {
        showAlert = useEModal().showAlert;
        return () => null;
      },
    });
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = createApp(caller);
    app.mount(host);

    const result = showAlert?.("Alert", "Alert body", {
      hideBackdrop: true,
      noFade: true,
      noFocus: true,
    });

    await nextTick();
    const acceptButton = document.querySelector<HTMLButtonElement>(
      ".e-modal__btn-group button:last-child"
    );
    expect(acceptButton).not.toBeNull();
    acceptButton?.click();

    await expect(result).resolves.toBe(true);
    await nextTick();
    expect(document.querySelector(".e-modal")).toBeNull();

    app.unmount();
    host.remove();
  });
});
