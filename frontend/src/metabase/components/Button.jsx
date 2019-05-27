import styled from "styled-components";
import {
  space,
  color,
  background,
  borderRadius,
  buttonStyle,
  compose,
} from "styled-system";

import colors, { lighten } from "metabase/lib/colors";

// HACK - this needs to be "button" right now in order to get forms
// to submit due to the lack of "as" since we're on an older version
// of styled-system due to our outdated React version
// eventually this can be styled(Box) and we can use "as: Button" in places where that's required
//
//
const buttonProps = compose(
  space,
  color,
  borderRadius,
);
const Button = styled("button")`
  ${buttonProps};

  ${buttonStyle};

  font-family: Lato, sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 300ms linear;
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
    backgroundColor: "white",
    "&:hover": {
      color: PRIMARY_COLOR,
    },
  },
  primary: {
    color: "white",
    backgroundColor: PRIMARY_COLOR,
    "&:hover": {
      backgroundColor: lighten(PRIMARY_COLOR, 0.2),
    },
  },
  danger: {
    color: "white",
    backgroundColor: DANGER_COLOR,
    "&:hover": {
      backgroundColor: lighten(DANGER_COLOR, 0.2),
    },
  },
};

Button.displayName = "Button";

export default Button;
