import React from "react";
import { Box, Flex } from "grid-styled";

import fitViewport from "metabase/hoc/FitViewPort";

@fitViewport
class ModesApp extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <div className={this.props.fitClassNames}>
        <Flex className="relative full-height" w="100%" align="center">
          <Box>Modes yeah?</Box>
          <Box>Details</Box>
          <Box>{children}</Box>
        </Flex>
      </div>
    );
  }
}

export default ModesApp;
