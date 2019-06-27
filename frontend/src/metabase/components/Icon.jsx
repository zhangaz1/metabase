/*eslint-disable react/no-danger */

import React, { Component } from "react";
import RetinaImage from "react-retina-image";
import styled from "styled-components";
import { color, space, hover, height } from "styled-system";
import cx from "classnames";
import colors, { darken } from "metabase/lib/colors";
import { Flex } from "grid-styled";

import { loadIcon } from "metabase/icon_paths";
import { stripLayoutProps } from "metabase/lib/utils";

import Tooltipify from "metabase/hoc/Tooltipify";

const interactionColor = darken(colors["brand"], 0.2);

export const IconWrapper = styled(Flex).attrs({
  alignItems: "center",
  justifyContent: "center",
  w: 40,
  height: 40,
})`
  ${height};
  ${hover};
  border-radius: 6px;
  cursor: pointer;
  color: ${props => (props.open ? colors["brand"] : "inherit")};
  background-color: ${props => (props.open ? interactionColor : "transparent")};
  &:hover {
    background-color: ${interactionColor};
    transition: all 300ms linear;
  }
  // special cases for certain icons
  // Icon-share has a taller viewvbox than most so to optically center
  // the icon we need to translate it upwards
  "> .icon.icon-share": {
    transform: translateY(-2px);
  }
`;

class BaseIcon extends Component {
  static props: {
    name: string,
    size?: string | number,
    width?: string | number,
    height?: string | number,
    scale?: string | number,
    tooltip?: string, // using Tooltipify
  };

  render() {
    const icon = loadIcon(this.props.name);
    if (!icon) {
      return null;
    }
    const className = cx(
      icon.attrs && icon.attrs.className,
      this.props.className,
    );
    const props = { ...icon.attrs, ...this.props, className };
    for (const prop of ["width", "height", "size", "scale"]) {
      if (typeof props[prop] === "string") {
        props[prop] = parseInt(props[prop], 10);
      }
    }
    if (props.size != null) {
      props.width = props.size;
      props.height = props.size;
    }
    if (props.scale != null && props.width != null && props.height != null) {
      props.width *= props.scale;
      props.height *= props.scale;
    }

    if (icon.img) {
      return (
        <RetinaImage
          forceOriginalDimensions={false}
          {...props}
          src={icon.img}
        />
      );
    } else if (icon.svg) {
      return <svg {...props} dangerouslySetInnerHTML={{ __html: icon.svg }} />;
    } else {
      return (
        <svg {...stripLayoutProps(props)}>
          <path d={icon.path} />
        </svg>
      );
    }
  }
}

const Icon = styled(BaseIcon)`
  ${space}
  ${color}
  ${hover}
  flex-shrink: 0
`;
export default Tooltipify(Icon);
