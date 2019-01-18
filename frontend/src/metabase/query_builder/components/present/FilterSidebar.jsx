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

import DatePicker, { getOperator } from "../filters/pickers/DatePicker.jsx";
import TimePicker from "../filters/pickers/TimePicker.jsx";
import NumberPicker from "../filters/pickers/NumberPicker.jsx";
import SelectPicker from "../filters/pickers/SelectPicker.jsx";
import TextPicker from "../filters/pickers/TextPicker.jsx";
import FieldValuesWidget from "metabase/components/FieldValuesWidget.jsx";

class FilterOptionList extends React.Component {
  render() {
    const { query, onClick } = this.props;
    return (
      <Box>
        {query.filterFieldOptions().dimensions.map(dimension => (
          <Flex
            align="center"
            key={dimension.field().id}
            onClick={() => onClick(dimension)}
            p={1}
            className="cursor-pointer text-brand-hover"
          >
            <Icon name={dimension.icon()} mr={1} size={18} />
            <h4>{dimension.displayName()}</h4>
          </Flex>
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
class FilterSidebar extends React.Component {
  render() {
    const {
      query,
      uiControls,
      focusFilterDrawer,
      toggleFilterDrawer,
    } = this.props;

    return (
      <Box className="relative" p={2}>
        <Flex onClick={() => toggleFilterDrawer()}>
          <Icon name="close" ml="auto" />
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
          onClick={field => focusFilterDrawer({ field: field.field() })}
        />
      </Box>
    );
  }
}

export default FilterSidebar;
