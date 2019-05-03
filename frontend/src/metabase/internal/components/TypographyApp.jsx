import React from "react";
import styled from "styled-components";
import { fontFamily } from "styled-system";
import { Box, Flex } from "grid-styled";

import Text from "metabase/components/Text";

import Heading from "metabase/components/Heading";

const Label = Text.withComponent("h3");

Label.defaultProps = {
  color: "text-medium",
  fontSize: 1,
};

const TypeBlock = ({ children }) => (
  <Box className="border-bottom" py={2}>
    {children}
  </Box>
);

const TypeViewer = styled("div")`
  ${fontFamily};
`;

const TypeSample = ({ fontFamily, sample }) => (
  <Flex align="top">
    <Box flex={2 / 3}>
      <TypeViewer fontFamily={fontFamily}>
        <Text fontSize={6}>{sample}</Text>
      </TypeViewer>
    </Box>
    <Box flex={1 / 3}>
      <Label>{fontFamily}</Label>
      <Text>
        Lato reads well in paragraphs but also looks bold and graphic while
        reataining charm when used at larger sizes, making it a great all around
        workhorse typeface.
      </Text>
    </Box>
  </Flex>
);

const TypeApp = () => (
  <Box ml="auto" mr="auto" w={3 / 4}>
    <Box my={2}>
      <Heading>Typography</Heading>
    </Box>
    <Box>
      <TypeBlock>
        <Label>Heading</Label>
        <Heading>Pay attention to me</Heading>
      </TypeBlock>
      <TypeBlock>
        <Label>Paragraph</Label>
        <Text>
          This is some explanatory text from Metabot, or maybe the setup
          instructions for something. It’s from us, not from the user. We’re
          repeating ourselves at this point and kinda just talking a bunch so
          that you can get a sense of the weight of the text and the rag when
          it’s longer, ok you get it so we’ll stop.
        </Text>
      </TypeBlock>
    </Box>
    <Box mt={3}>
      <Heading>Typefaces we use</Heading>
      <Box>
        <TypeSample
          sample="
          I speak for the users, for the users… wait where is this Seuss
          reference going?"
          fontFamily="Lato"
          description="Lato reads well in paragraphs but also looks bold and graphic while reataining charm when used at larger sizes, making it a great all around workhorse typeface."
        />
        <TypeSample
          fontFamily="Lora"
          sample="
          I speak for the users, for the users… wait where is this Seuss
          reference going?"
          description=""
        />
        <TypeSample
          sample="
          Becky with the good code"
          fontFamily="Source Code Pro Semibold"
          description="Lato reads well in paragraphs but also looks bold and graphic while reataining charm when used at larger sizes, making it a great all around workhorse typeface."
        />
      </Box>
    </Box>
  </Box>
);

export default TypeApp;
