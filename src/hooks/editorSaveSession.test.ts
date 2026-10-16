import { describe, expect, it, vi } from "vitest";
import { saveInEditorSession } from "./editorSaveSession";

function setup() {
  let session = 0;
  const close = vi.fn();
  const reportClosedFailure = vi.fn();
  let settle: { resolve: () => void; reject: (error: Error) => void } = {
    resolve: () => undefined,
    reject: () => undefined,
  };
  const persist = () =>
    new Promise<void>((resolve, reject) => {
      settle = { resolve, reject };
    });
  const save = () =>
    saveInEditorSession(() => session, persist, {
      close,
      reportClosedFailure,
    });
  return {
    close,
    reportClosedFailure,
    save,
    settle: () => settle,
    /** The editor closes, or another task's editor opens. */
    nextEditor: () => {
      session += 1;
    },
  };
}

describe("saveInEditorSession", () => {
  it("closes the editor after a successful save", async () => {
    const editor = setup();
    const saving = editor.save();
    editor.settle().resolve();

    await saving;
    expect(editor.close).toHaveBeenCalledOnce();
  });

  it("rejects while the editor is open, so it shows the error", async () => {
    const editor = setup();
    const saving = editor.save();
    editor.settle().reject(new Error("vault is read-only"));

    await expect(saving).rejects.toThrow("vault is read-only");
    expect(editor.close).not.toHaveBeenCalled();
    expect(editor.reportClosedFailure).not.toHaveBeenCalled();
  });

  it("reports a failure that arrives after the editor was closed", async () => {
    const editor = setup();
    const saving = editor.save();
    editor.nextEditor();
    editor.settle().reject(new Error("vault is read-only"));

    await expect(saving).resolves.toBeUndefined();
    expect(editor.reportClosedFailure).toHaveBeenCalledWith(
      new Error("vault is read-only"),
    );
  });

  it("does not close another task's editor opened during the save", async () => {
    const editor = setup();
    const saving = editor.save();
    editor.nextEditor();
    editor.settle().resolve();

    await saving;
    expect(editor.close).not.toHaveBeenCalled();
  });
});
