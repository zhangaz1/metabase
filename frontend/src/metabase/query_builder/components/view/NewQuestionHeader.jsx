import React from "react";

import ViewSection, { ViewHeading } from "./ViewSection";
import Link from "metabase/components/Link";

export default function NewQuestionHeader(props) {
  return (
    <ViewSection {...props}>
      <ViewHeading>{`Pick your starting data`}</ViewHeading>
      <Link ml="auto">Use sql?</Link>
    </ViewSection>
  );
}
