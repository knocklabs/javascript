import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { JSONSchema7 } from "json-schema";
import { describe, expect, it } from "vitest";

import { getJSONSchema, stateExtensions, updateSchema } from "../state";

describe("schema state", () => {
  it("initializes schema via stateExtensions()", () => {
    const schema: JSONSchema7 = {
      type: "object",
      properties: {
        foo: { type: "string" },
      },
    };

    const state = EditorState.create({
      doc: "{}",
      extensions: [stateExtensions(schema)],
    });

    expect(getJSONSchema(state)).toEqual(schema);
  });

  it("updates schema per-editor via updateSchema()", () => {
    const schema1: JSONSchema7 = {
      type: "object",
      required: ["foo"],
      properties: { foo: { type: "string" } },
    };
    const schema2: JSONSchema7 = {
      type: "object",
      required: ["bar"],
      properties: { bar: { type: "number" } },
    };

    const state = EditorState.create({
      doc: "{}",
      extensions: [stateExtensions(schema1)],
    });

    const view = new EditorView({ state });
    try {
      expect(getJSONSchema(view.state)).toEqual(schema1);

      updateSchema(view, schema2);
      expect(getJSONSchema(view.state)).toEqual(schema2);

      updateSchema(view, undefined);
      expect(getJSONSchema(view.state)).toBeUndefined();
    } finally {
      view.destroy();
    }
  });
});
