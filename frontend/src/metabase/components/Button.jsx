import styled from "styled-components";
import {
  space,
  color,
  borderRadius,
  buttonStyle,
  compose,
} from "styled-system";

import colors, { lighten, darken } from "metabase/lib/colors";

const buttonProps = compose(
  space,
  color,
  borderRadius,
);

const Button = styled("button")`
  border: 1px solid;
  ${buttonProps};

  ${buttonStyle};

  font-family: Lato, sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 300ms linear;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }
`;

Button.defaultProps = {
  p: [1, 2],
  borderRadius: 6,
  variant: "default",
};

const DANGER_COLOR = colors["error"];
const PRIMARY_COLOR = colors["brand"];

Button.variants = {
  default: {
    color: colors["text-dark"],
    borderColor: darken(colors["bg-medium"], 0.12),
    backgroundColor: colors["bg-light"],
    "&:hover": {
      color: PRIMARY_COLOR,
      backgroundColor: lighten(colors["bg-light"], 0.08),
    },
  },
  primary: {
    color: "white",
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
    "&:hover": {
      backgroundColor: lighten(PRIMARY_COLOR, 0.12),
      borderColor: lighten(PRIMARY_COLOR, 0.12),
    },
  },
  danger: {
    color: "white",
    backgroundColor: DANGER_COLOR,
    borderColor: DANGER_COLOR,
    "&:hover": {
      backgroundColor: lighten(DANGER_COLOR, 0.2),
      borderColor: lighten(DANGER_COLOR, 0.2),
    },
  },
};

Button.displayName = "Button";

export default Button;
