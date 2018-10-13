import React from "react";
import { Box, Flex } from "grid-styled";

import Icon, { IconWrapper } from "metabase/components/Icon";
import Link from "metabase/components/Link";

import * as Urls from "metabase/lib/urls";

import fitViewport from "metabase/hoc/FitViewPort";

@fitViewport
class ModesApp extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <div className="overflow-hidden relative full-height flex align-center justify-center">
        <Flex
          className="relative full-height"
          w="100%"
          flex={1}
          flexWrap="wrap"
        >
          <Flex
            align="center"
            flexDirection="column"
            w={60}
            className="full-height bg-medium"
          >
            <Link to={`${Urls.question(this.props.params.cardId)}/preview`}>
              <IconWrapper>
                <Icon name="star" />
              </IconWrapper>
            </Link>
            <Link to={`${Urls.question(this.props.params.cardId)}`}>
              <IconWrapper>
                <Icon name="bar" />
              </IconWrapper>
            </Link>
          </Flex>

          <Box w={320} p={2}>
            Details
          </Box>
          <Box className="relative bg-white top overflow-scroll" flex={1}>
            {children}
          </Box>
        </Flex>
      </div>
    );
  }
}

export default ModesApp;
