import React from "react";
import { connect } from "react-redux";
import { Box, Flex } from "grid-styled";

import {
  focusFilterDrawer,
  toggleFilterDrawer,
} from "metabase/query_builder/actions";

const mapStateToProps = state => ({
  uiControls: state.qb.uiControls,
});
const mapDispatchToProps = {
  focusFilterDrawer,
  toggleFilterDrawer,
};

import Icon from "metabase/components/Icon";

const Picker = ({ dimension, filter, onClick }) => {
  return (
    <Box ml="auto">
      {dimension.field().fieldType() === "NUMBER" ? (
        <input className="input" type="text" autoFocus />
      ) : (
        <Box className="text-brand-hover" onClick={() => onClick(dimension)}>
          Pick a value
        </Box>
      )}
    </Box>
  );
};

class FilterOptionList extends React.Component {
  render() {
    const { query, onClick } = this.props;
    window.q = query;
    const options = query.filterFieldOptions();
    return (
      <Box>
        {// start with the table dimensions
        options.dimensions.map(dimension => (
          <Flex
            align="center"
            key={dimension.field().id}
            p={1}
            className="cursor-pointer"
          >
            <Icon name={dimension.icon()} mr={1} size={18} />
            <h4>{dimension.displayName()}</h4>

            <Picker dimension={dimension} onClick={onClick} />
          </Flex>
        ))}
        {options.fks &&
          options.fks.map(fk => (
            <Box my={3}>
              <h3>Table</h3>
              {fk.dimensions.map(dimension => (
                <Flex
                  align="center"
                  key={dimension.field().id}
                  p={1}
                  className="cursor-pointer"
                >
                  <Icon name={dimension.icon()} mr={1} size={18} />
                  <h4>{dimension.displayName()}</h4>

                  <Picker dimension={dimension} onClick={onClick} />
                </Flex>
              ))},
            </Box>
          ))}
      </Box>
    );
  }
}

class FieldFilterPane extends React.Component {
  constructor(props) {
    super(props);
    // this sucks
    const initialValue =
      props.index &&
      `${props.query.filters()[props.index][0]}${
        props.query.filters()[props.index][2]
      }`;
    this.state = {
      currentValue: initialValue || "",
    };
  }
  render() {
    const { query, value, goBack, index } = this.props;
    const { currentValue } = this.state;
    return (
      <Box bg="white" p={2}>
        <Flex align="center">
          <Box onClick={() => goBack()}>
            <Icon name="chevronleft" />
          </Box>
          <Box ml="auto" />
        </Flex>
        <Box>
          <h3>{value.display_name}</h3>
        </Box>
        <Box>
          {value.fieldType() === "NUMBER" ? (
            <input
              className="input full"
              type="text"
              placeholder="Enter a number"
              value={currentValue}
              onChange={ev => this.setState({ currentValue: ev.target.value })}
              autoFocus
            />
          ) : (
            <Box>Hold tight, working on it.</Box>
          )}
        </Box>
        <Flex align="center" my={2}>
          <a
            onClick={() => {
              if (!index) {
                return false;
              }
              const myQ = query.removeFilter(index);
              myQ.update(this.props.setDatasetQuery);
              goBack();
            }}
          >
            Clear
          </a>
          <a
            className="ml-auto"
            onClick={() => {
              const hasOperator = value => {
                return [">", "<", "<=", ">="].some(
                  o => value.charAt(0).indexOf(o) > -1,
                );
              };

              const myQ = query.addFilter([
                hasOperator(currentValue) ? currentValue.charAt(0) : "=",
                ["field-id", value.id],
                hasOperator(currentValue)
                  ? currentValue.slice(1)
                  : currentValue,
              ]);
              myQ.update(this.props.setDatasetQuery);
              this.props.run({ ignoreCache: true });
              goBack();
            }}
          >
            Apply
          </a>
        </Flex>
      </Box>
    );
  }
}

@connect(mapStateToProps, mapDispatchToProps)
class FilterSidebarInline extends React.Component {
  render() {
    const {
      query,
      uiControls,
      focusFilterDrawer,
      toggleFilterDrawer,
    } = this.props;

    return (
      <Box className="relative" p={3}>
        <Flex onClick={() => toggleFilterDrawer()}>
          <Icon name="close" ml="auto" />
        </Flex>
        <Flex align="center" my={1}>
          <h2>Filters</h2>
        </Flex>
        {uiControls.referencedField && (
          <Box className="z2 absolute top left bottom right" bg="white">
            <FieldFilterPane
              query={query}
              value={uiControls.referencedField}
              goBack={() => focusFilterDrawer({ field: null })}
              setDatasetQuery={this.props.setDatasetQuery}
              run={this.props.runQuestionQuery}
              index={uiControls.filterIndex}
            />
          </Box>
        )}
        <FilterOptionList
          query={query}
          onClick={dimension => focusFilterDrawer({ field: dimension.field() })}
        />
      </Box>
    );
  }
}

export default FilterSidebarInline;
