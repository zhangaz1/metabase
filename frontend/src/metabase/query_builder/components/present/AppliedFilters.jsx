import React from "react";
import { connect } from "react-redux";
import { Box, Flex } from "grid-styled";
import Dimension from "metabase-lib/lib/Dimension";

import { focusFilterDrawer } from "metabase/query_builder/actions";

const mapStateToProps = state => ({
  uiControls: state.qb.uiControls,
});
const mapDispatchToProps = {
  focusFilterDrawer,
};

@connect(mapStateToProps, mapDispatchToProps)
class AppliedFilters extends React.Component {
  render() {
    const { query, uiControls, focusFilterDrawer } = this.props;
    return (
      <Flex align="center">
        {query.filters().map(filter => {
          const [operator, fieldExp, value] = filter;
          const dimension = Dimension.parseMBQL(fieldExp, query.metadata());
          const field = dimension.field();
          return (
            <Box
              className="bordered rounded shadowed"
              p={1}
              onClick={() => focusFilterDrawer(field)}
            >
              {field.display_name}
              {operator}
              {value}
            </Box>
          );
        })}
      </Flex>
    );
  }
}

export default AppliedFilters;
