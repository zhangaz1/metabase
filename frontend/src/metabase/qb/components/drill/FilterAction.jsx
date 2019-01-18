/* @flow */
import { t } from "c-3po";
import type {
  ClickAction,
  ClickActionProps,
} from "metabase/meta/types/Visualization";

function startFilterForField(...args) {
  return require("metabase/query_builder/actions").focusFilterDrawer(...args);
}

export default ({ question, clicked }: ClickActionProps): ClickAction[] => {
  if (!clicked || clicked.value !== undefined || !clicked.column) {
    return [];
  }
  const { column } = clicked;

  const field = question
    .query()
    .filterFieldOptions()
    .dimensions.filter(d => d.field().id === column.id)[0]
    .field();

  return [
    {
      name: "filtering",
      section: "Filtering",
      title: t`Filter`,
      action: () => startFilterForField({ field }),
    },
  ];
};
