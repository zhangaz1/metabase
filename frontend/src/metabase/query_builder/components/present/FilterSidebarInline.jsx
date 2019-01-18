import React from "react";
import { Box, Flex } from "grid-styled";

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
  state = {
    currentValue: "",
  };
  render() {
    const { query, value, goBack } = this.props;
    const { currentValue } = this.state;
    return (
      <Box bg="white" p={2}>
        <Box onClick={() => goBack()}>
          <Icon name="chevronleft" />
        </Box>
        <Box>
          <h3>{value.displayName()}</h3>
        </Box>
        <Box>
          {value.field().fieldType() === "NUMBER" && (
            <input
              className="input"
              type="text"
              value={currentValue}
              onChange={ev => this.setState({ currentValue: ev.target.value })}
            />
          )}
        </Box>
        <Flex align="center">
          <a>Clear</a>
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
                ["field-id", value.field().id],
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

class FilterSidebarInline extends React.Component {
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
              query={query}
              value={selectedField}
              goBack={() => this.setState({ selectedField: null })}
              setDatasetQuery={this.props.setDatasetQuery}
              run={this.props.runQuestionQuery}
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

export default FilterSidebarInline;
