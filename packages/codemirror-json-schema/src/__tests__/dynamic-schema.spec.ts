import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { JSONSchema7 } from "json-schema";
import { describe, expect, it } from "vitest";

import { updateSchema } from "../features/state";
import { jsonSchemaLinter } from "../features/validation";
import { json5Schema } from "../json5/bundled";
import { json5SchemaLinter } from "../json5/validation";
import { jsonSchema } from "../json/bundled";
import { yamlSchema } from "../yaml/bundled";
import { yamlSchemaLinter } from "../yaml/validation";

type DynamicSchemaFixture = {
  name: string;
  extensions: (schema?: JSONSchema7) => unknown[];
  linter: () => (view: EditorView) => Array<{ message: string }>;
  doc: string;
};

const schemaFoo: JSONSchema7 = {
  type: "object",
  required: ["foo"],
  properties: {
    foo: { type: "string" },
  },
};

const schemaBar: JSONSchema7 = {
  type: "object",
  required: ["bar"],
  properties: {
    bar: { type: "number" },
  },
};

const fixtures: DynamicSchemaFixture[] = [
  {
    name: "json",
    extensions: (schema) => jsonSchema(schema),
    linter: () => jsonSchemaLinter(),
    doc: "{}",
  },
  {
    name: "json5",
    extensions: (schema) => json5Schema(schema),
    linter: () => json5SchemaLinter(),
    doc: "{ }",
  },
  {
    name: "yaml",
    extensions: (schema) => yamlSchema(schema),
    linter: () => yamlSchemaLinter(),
    doc: "---\n{}\n",
  },
];

describe("dynamic schema updates (bundled modes)", () => {
  it.each(fixtures)(
    "$name: schema changes affect validation results",
    ({ extensions, linter, doc }) => {
      const state = EditorState.create({
        doc,
        extensions: extensions(schemaFoo),
      });

      const view = new EditorView({ state });
      try {
        const lint = linter();

        const initial = lint(view);
        expect(initial.length).toBeGreaterThan(0);
        expect(initial.some((d) => d.message.includes("foo"))).toBe(true);

        updateSchema(view, schemaBar);
        const afterUpdate = lint(view);
        expect(afterUpdate.length).toBeGreaterThan(0);
        expect(afterUpdate.some((d) => d.message.includes("bar"))).toBe(true);
      } finally {
        view.destroy();
      }
    },
  );
});
