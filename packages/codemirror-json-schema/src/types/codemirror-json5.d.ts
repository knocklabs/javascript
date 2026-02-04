declare module "codemirror-json5" {
  import type { LanguageSupport, LRLanguage } from "@codemirror/language";
  import type { Linter } from "@codemirror/lint";

  export function json5(): LanguageSupport;
  export const json5Language: LRLanguage;
  export function json5ParseLinter(): Linter;
}
