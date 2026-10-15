import { describe, expect, it, vi } from "vitest";
import type { ToastMessage } from "../types";
import {
  createToastInteractionController,
  TOAST_INTERACTION_UNAVAILABLE_ERROR,
} from "./toastInteractions";

function setup() {
  const shown: ToastMessage[] = [];
  const hide = vi.fn();
  const controller = createToastInteractionController({
    show: (toast) => shown.push(toast),
    hide,
  });
  const lastToast = () => {
    const toast = shown.at(-1);
    if (!toast) throw new Error("no toast was shown");
    return toast;
  };
  return { controller, shown, hide, lastToast };
}

describe("toast interaction controller", () => {
  describe("confirm", () => {
    it("resolves true when the user clicks Yes", async () => {
      const { controller, hide, lastToast } = setup();
      const answer = controller.confirm("Delete?", "Gone for good");
      const toast = lastToast();
      expect(toast).toMatchObject({
        title: "Delete?",
        description: "Gone for good",
        timeout: null,
      });

      if (toast.interaction.kind !== "confirm") throw new Error("not confirm");
      toast.interaction.onConfirm();

      await expect(answer).resolves.toBe(true);
      expect(hide).toHaveBeenCalledWith(toast.id);
    });

    it("resolves false when the user clicks No", async () => {
      const { controller, hide, lastToast } = setup();
      const answer = controller.confirm("Delete?");
      const toast = lastToast();

      if (toast.interaction.kind !== "confirm") throw new Error("not confirm");
      toast.interaction.onCancel?.();

      await expect(answer).resolves.toBe(false);
      expect(hide).toHaveBeenCalledWith(toast.id);
    });

    it("resolves null when the toast is closed with X", async () => {
      const { controller, hide, lastToast } = setup();
      const answer = controller.confirm("Delete?");
      const toast = lastToast();

      controller.dismiss(toast.id);

      await expect(answer).resolves.toBeNull();
      expect(hide).toHaveBeenCalledWith(toast.id);
    });

    it("keeps the first answer when the toast is closed afterwards", async () => {
      const { controller, lastToast } = setup();
      const answer = controller.confirm("Delete?");
      const toast = lastToast();

      if (toast.interaction.kind !== "confirm") throw new Error("not confirm");
      toast.interaction.onCancel?.();
      controller.dismiss(toast.id);

      await expect(answer).resolves.toBe(false);
    });
  });

  describe("select", () => {
    const options = [
      { label: "PostgreSQL", value: "postgres" },
      { label: "MySQL", value: "mysql" },
    ];

    it("resolves the chosen value", async () => {
      const { controller, lastToast } = setup();
      const answer = controller.select("Which database?", options);
      const toast = lastToast();

      if (toast.interaction.kind !== "select") throw new Error("not select");
      expect(toast.interaction.options).toEqual(options);
      toast.interaction.onSelect("mysql");

      await expect(answer).resolves.toBe("mysql");
    });

    it("resolves null when cancelled", async () => {
      const { controller, lastToast } = setup();
      const answer = controller.select("Which database?", options);
      const toast = lastToast();

      if (toast.interaction.kind !== "select") throw new Error("not select");
      toast.interaction.onCancel?.();

      await expect(answer).resolves.toBeNull();
    });

    it("resolves null, not false, when the toast is closed with X", async () => {
      const { controller, lastToast } = setup();
      const answer = controller.select("Which database?", options);

      controller.dismiss(lastToast().id);

      await expect(answer).resolves.toBeNull();
    });
  });

  describe("prompt", () => {
    it("resolves the submitted text", async () => {
      const { controller, lastToast } = setup();
      const answer = controller.prompt("Name?");
      const toast = lastToast();

      if (toast.interaction.kind !== "prompt") throw new Error("not prompt");
      toast.interaction.onSubmit("Groceries");

      await expect(answer).resolves.toBe("Groceries");
    });

    it("resolves null when cancelled", async () => {
      const { controller, lastToast } = setup();
      const answer = controller.prompt("Name?");
      const toast = lastToast();

      if (toast.interaction.kind !== "prompt") throw new Error("not prompt");
      toast.interaction.onCancel?.();

      await expect(answer).resolves.toBeNull();
    });

    it("resolves null, not false, when the toast is closed with X", async () => {
      const { controller, lastToast } = setup();
      const answer = controller.prompt("Name?");

      controller.dismiss(lastToast().id);

      await expect(answer).resolves.toBeNull();
    });
  });

  it("dismisses a plain toast without affecting waiting questions", async () => {
    const { controller, hide, lastToast } = setup();
    const answer = controller.confirm("Delete?");
    const toast = lastToast();

    controller.dismiss("some-other-toast");
    expect(hide).toHaveBeenCalledWith("some-other-toast");

    if (toast.interaction.kind !== "confirm") throw new Error("not confirm");
    toast.interaction.onConfirm();
    await expect(answer).resolves.toBe(true);
  });

  it("gives each question its own toast id", () => {
    const { controller, shown } = setup();
    void controller.confirm("One?");
    void controller.prompt("Two?");

    expect(shown).toHaveLength(2);
    expect(shown[0].id).not.toBe(shown[1].id);
  });

  describe("dispose", () => {
    it("rejects every waiting question and hides its toast", async () => {
      const { controller, shown, hide } = setup();
      const confirm = controller.confirm("Delete?");
      const select = controller.select("Pick", [{ label: "A", value: "a" }]);
      const prompt = controller.prompt("Name?");

      controller.dispose();

      await expect(confirm).rejects.toThrow(
        TOAST_INTERACTION_UNAVAILABLE_ERROR,
      );
      await expect(select).rejects.toThrow(TOAST_INTERACTION_UNAVAILABLE_ERROR);
      await expect(prompt).rejects.toThrow(TOAST_INTERACTION_UNAVAILABLE_ERROR);
      for (const toast of shown) {
        expect(hide).toHaveBeenCalledWith(toast.id);
      }
    });

    it("rejects new questions immediately without showing a toast", async () => {
      const { controller, shown } = setup();
      controller.dispose();

      await expect(controller.confirm("Delete?")).rejects.toThrow(
        TOAST_INTERACTION_UNAVAILABLE_ERROR,
      );
      await expect(
        controller.select("Pick", [{ label: "A", value: "a" }]),
      ).rejects.toThrow(TOAST_INTERACTION_UNAVAILABLE_ERROR);
      await expect(controller.prompt("Name?")).rejects.toThrow(
        TOAST_INTERACTION_UNAVAILABLE_ERROR,
      );
      expect(shown).toHaveLength(0);
    });

    it("ignores clicks on a toast whose question was already rejected", async () => {
      const { controller, lastToast } = setup();
      const answer = controller.confirm("Delete?");
      const toast = lastToast();
      controller.dispose();
      await expect(answer).rejects.toThrow(TOAST_INTERACTION_UNAVAILABLE_ERROR);

      if (toast.interaction.kind !== "confirm") throw new Error("not confirm");
      expect(toast.interaction.onConfirm).not.toThrow();
    });

    it("accepts questions again after activate (StrictMode remount)", async () => {
      const { controller, lastToast } = setup();
      controller.dispose();
      controller.activate();

      const answer = controller.confirm("Delete?");
      const toast = lastToast();
      if (toast.interaction.kind !== "confirm") throw new Error("not confirm");
      toast.interaction.onConfirm();

      await expect(answer).resolves.toBe(true);
    });
  });
});
