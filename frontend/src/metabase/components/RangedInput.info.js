import React from "react";
import RangedInput from "metabase/components/RangedInput";

export const component = RangedInput;

export const description = `
An input that allows either a single value or value range.
`;

export const examples = {
  Default: <RangedInput value={2} />,
  WithRange: <RangedInput value={2} secondaryValue={4} />,
};
