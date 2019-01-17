import React from "react";
import { Box, Flex } from "grid-styled";

import Icon from "metabase/components/Icon";

class FilterOptionList extends React.Component {
  render() {
    const { query, onClick } = this.props;
    return (
      <Box>
        {query.filterFieldOptions().dimensions.map(d => (
          <Box onClick={() => onClick(d)} p={1}>
            <Icon name={d.icon()} mr={1} />
            {d.displayName()}
          </Box>
        ))}
      </Box>
    );
  }
}

class FieldFilterPane extends React.Component {
  render() {
    const { value, goBack } = this.props;
    return (
      <Box bg="white" p={2}>
        <Box onClick={() => goBack()}>
          <Icon name="chevronleft" />
        </Box>
        <Box>
          <h3>{value.displayName()}</h3>
        </Box>
      </Box>
    );
  }
}

class FilterSidebar extends React.Component {
  state = {
    selectedField: null,
  };
  render() {
    const { query } = this.props;
    const { selectedField } = this.state;

    return (
      <Box w={460} className="relative" p={2}>
        {selectedField && (
          <Box className="z2 absolute top left bottom right" bg="white">
            <FieldFilterPane
              value={selectedField}
              goBack={() => this.setState({ selectedField: null })}
            />
          </Box>
        )}
        <FilterOptionList
          query={query}
          onClick={field => this.setState({ selectedField: field })}
        />
      </Box>
    );
  }
}

export default FilterSidebar;
