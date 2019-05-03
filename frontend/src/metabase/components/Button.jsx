import React from "react";
import styled from "styled-components";
import { space, color } from "styled-system";

const Button = styled("button")`
  ${color};
  ${space};
  border-radius: 4px;
  font-weight: 700;
  font-family: Lato;
`;

Button.defaultProps = {
  bg: "brand",
  p: [1, 2],
  color: "brand",
};

export default Button;
