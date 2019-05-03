import styled from "styled-components";
import { color, space, fontSize, fontWeight, lineHeight } from "styled-system";

const Text = styled("p")`
  ${space}
  ${fontSize}
  ${lineHeight}
  ${color}
  ${fontWeight}
  max-width: 52em;
`;

Text.defaultProps = {
  fontSize: [1, 2],
  lineHeight: 1.62,
};

export default Text;
