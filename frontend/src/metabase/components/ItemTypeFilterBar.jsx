import React from "react";
import { Flex } from "grid-styled";
import { t } from "ttag";
import { withRouter } from "react-router";

import Icon from "metabase/components/Icon";
import Link from "metabase/components/Link";

import { color } from "metabase/lib/colors";

export const FILTERS = [
  {
    name: t`Everything`,
    filter: null,
    icon: "list",
  },
  {
    name: t`Dashboards`,
    filter: "dashboard",
    icon: "dashboard",
  },
  {
    name: t`Questions`,
    filter: "card",
    icon: "bar",
  },
  {
    name: t`Pulses`,
    filter: "pulse",
    icon: "pulse",
  },
];

const ItemTypeFilterBar = props => {
  const { location, analyticsContext } = props;
  return (
    <Flex align="center" mt={1}>
      {props.filters.map(f => {
        let isActive = location && location.query.type === f.filter;

        if (!location.query.type && !f.filter) {
          isActive = true;
        }

        const linkColor = isActive ? color("white") : color("brand");

        return (
          <Link
            to={{
              pathname: location.pathname,
              query: { ...location.query, type: f.filter },
            }}
            color={linkColor}
            hover={{ color: color("brand") }}
            bg={isActive ? color("brand") : "transparent"}
            className="bordered"
            mr={[0, 2]}
            key={f.filter}
            py={1}
            px={2}
            style={{ borderRadius: 99 }}
            data-metabase-event={`${analyticsContext};Item Filter;${f.name}`}
          >
            <Icon name={f.icon} className="sm-hide" size={20} />
            <h4
              className="hide sm-show"
              style={{
                fontWeight: 900,
              }}
            >
              {f.name}
            </h4>
          </Link>
        );
      })}
    </Flex>
  );
};

ItemTypeFilterBar.defaultProps = {
  filters: FILTERS,
};

export default withRouter(ItemTypeFilterBar);
