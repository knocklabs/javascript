/**
 * Mimics the behavior of `json-source-map`'s `parseJSONDocument` function using codemirror EditorState... for YAML
 */
import { EditorState } from "@codemirror/state";
import YAML from "yaml";

import { MODES } from "../constants";
import { getJsonPointers } from "../utils/json-pointers";

/**
 * Return parsed data and YAML pointers for a given codemirror EditorState
 * @group Utilities
 */
export function parseYAMLDocumentState(state: EditorState) {
  let data = null;
  try {
    data = YAML.parse(state.doc.toString());
    // return pointers regardless of whether YAML.parse succeeds
  } catch {
    // noop
  }
  const pointers = getJsonPointers(state, MODES.YAML);
  return { data, pointers };
}
