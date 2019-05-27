/* @flow */

import React, { Component } from "react";
import { Box, Flex } from "grid-styled";

import Icon from "metabase/components/Icon";

export default class IconsApp extends Component {
  render() {
    return (
      <Flex wrap px={4}>
        {Object.keys(require("metabase/icon_paths").ICON_PATHS).map(name => (
          <Box w={1 / 4} my={2}>
            <Box mb={2}>
              <Icon name={name} size={80} />
            </Box>
            <Flex align="center">
              <Icon name={name} size={12} mr={2} />
              <Icon name={name} size={32} />
            </Flex>
            <h3>{name}</h3>
          </Box>
        ))}
      </Flex>
    );
  }
}
