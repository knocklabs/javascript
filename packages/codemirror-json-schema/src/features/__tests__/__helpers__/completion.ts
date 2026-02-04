import {
  Completion,
  CompletionContext,
  CompletionResult,
  CompletionSource,
} from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { JSONSchema7 } from "json-schema";
import { expect, vitest } from "vitest";

import { MODES } from "../../../constants";
import { JSONMode } from "../../../types";
import { testSchema2 } from "../__fixtures__/schemas";

import { getExtensions } from "./index";

vitest.mock("@codemirror/autocomplete", async () => {
  const mod = await vitest.importActual<
    typeof import("@codemirror/autocomplete")
  >("@codemirror/autocomplete");
  return {
    ...mod,
    snippetCompletion(template: string, completion: Completion) {
      const c = {
        ...completion,
        // pass the snippet template to the completion result
        // to make it easier to test
        TESTONLY_template: template,
      };
      return mod.snippetCompletion(template, c);
    },
  };
});

type MockedCompletionResult = CompletionResult["options"][0] & {
  template?: string;
};

export async function expectCompletion(
  doc: string,
  results: MockedCompletionResult[],

  conf: {
    explicit?: boolean;
    schema?: JSONSchema7;
    mode?: JSONMode;
  } = {},
) {
  const cur = doc.indexOf("|");
  const currentSchema = conf?.schema ?? testSchema2;
  doc = doc.slice(0, cur) + doc.slice(cur + 1);

  const state = EditorState.create({
    doc,
    selection: { anchor: cur },
    extensions: getExtensions(conf.mode ?? MODES.JSON, currentSchema),
  });
  const _view = new EditorView({ state });

  const result = await state.languageDataAt<CompletionSource>(
    "autocomplete",
    cur,
  )[0](new CompletionContext(state, cur, !!conf.explicit));
  if (!result) {
    return expect(result).toEqual(results);
  }
  const filteredResults = result.options.map((item) => {
    const infoValue =
      typeof item.info === "function"
        ? ((item.info(item) as HTMLElement).textContent ?? "")
        : item.info;

    const info =
      infoValue === undefined && item.type === "property" ? "" : infoValue;

    const apply = typeof item.apply === "string" ? item.apply : undefined;

    // @ts-expect-error -- set by our vitest mock for easier assertions
    const template = item?.TESTONLY_template as string | undefined;

    return {
      label: item.label,
      type: item.type,
      detail: item.detail,
      ...(info !== undefined ? { info } : {}),
      ...(apply !== undefined ? { apply } : {}),
      ...(template !== undefined ? { template } : {}),
    };
  });
  expect(filteredResults).toEqual(results);
}
