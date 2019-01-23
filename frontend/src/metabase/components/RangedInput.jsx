import React from "react";

import styled from "styled-components";
import { Flex } from "grid-styled";

import Icon from "metabase/components/Icon";

const input = styled.input``;

class RangedInput extends React.Component {
  state = {
    triggeredRange: false,
  };
  render() {
    const { triggeredRange } = this.state;
    const { value, secondaryValue, onChange } = this.props;
    return (
      <Flex align="center" className="hover-parent hover--visibility">
        <input
          onChange={ev => onChange(ev.target.value)}
          value={value}
          className="input"
        />
        {(secondaryValue || triggeredRange) && (
          <input
            value={secondaryValue}
            autoFocus={triggeredRange}
            className="input"
          />
        )}
        {!triggeredRange &&
          !secondaryValue && (
            <Icon
              name="add"
              className="hover-child"
              onClick={() => this.setState({ triggeredRange: true })}
            />
          )}
      </Flex>
    );
  }
}

export default RangedInput;
