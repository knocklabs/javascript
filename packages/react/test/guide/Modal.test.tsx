import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ModalView } from "../../src/modules/guide/components/Modal/Modal";

describe("ModalView.Img", () => {
  test("renders a void img with no children", () => {
    const { getByAltText } = render(
      <ModalView.Img src="https://example.com/image.png" alt="Example image" />,
    );
    const img = getByAltText("Example image");
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveClass("knock-guide-modal__img");
    expect(img).toBeEmptyDOMElement();
  });
});
