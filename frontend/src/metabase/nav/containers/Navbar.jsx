import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { t } from "ttag";
import { Box, Flex } from "grid-styled";
import styled from "styled-components";
import { space, width } from "styled-system";
import colors from "metabase/lib/colors";
import color from "color";

import Search from "metabase/entities/search";
import Recents from "metabase/entities/recents";

import { connect } from "react-redux";
import { push } from "react-router-redux";

import * as Urls from "metabase/lib/urls";

import Button from "metabase/components/Button.jsx";
import Card from "metabase/components/Card";
import Icon, { IconWrapper } from "metabase/components/Icon";
import Link from "metabase/components/Link";
import LogoIcon from "metabase/components/LogoIcon.jsx";
import Tooltip from "metabase/components/Tooltip";
import EntityMenu from "metabase/components/EntityMenu";
import OnClickOutsideWrapper from "metabase/components/OnClickOutsideWrapper";

import Modal from "metabase/components/Modal";

import CreateDashboardModal from "metabase/components/CreateDashboardModal";

import ProfileLink from "metabase/nav/components/ProfileLink.jsx";

import { getPath, getContext, getUser } from "../selectors";
import Database from "metabase/entities/databases";

const mapStateToProps = (state, props) => ({
  path: getPath(state, props),
  context: getContext(state, props),
  user: getUser(state),
});

const mapDispatchToProps = {
  onChangeLocation: push,
};

const AdminNavItem = ({ name, path, currentPath }) => (
  <li>
    <Link
      to={path}
      data-metabase-event={`NavBar;${name}`}
      className={cx("NavItem py1 px2 no-decoration", {
        "is--selected": currentPath.startsWith(path),
      })}
    >
      {name}
    </Link>
  </li>
);

const DefaultSearchColor = color(colors.brand)
  .lighten(0.07)
  .string();
const ActiveSearchColor = color(colors.brand)
  .lighten(0.1)
  .string();

const SearchWrapper = Flex.extend`
  ${width} background-color: ${props =>
  props.active ? ActiveSearchColor : DefaultSearchColor};
  border-radius: 6px;
  align-items: center;
  color: white;
  position: relative;
  transition: background 300ms ease-in;
  &:hover {
    background-color: ${ActiveSearchColor};
  }
`;

const SearchInput = styled.input`
  ${space} ${width} background-color: transparent;
  border: none;
  color: white;
  font-size: 1em;
  font-weight: 700;
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: ${colors["text-white"]};
  }
`;

class SearchBar extends React.Component {
  state = {
    active: false,
    searchText: "",
  };

  componentWillMount() {
    this._updateSearchTextFromUrl(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this._updateSearchTextFromUrl(nextProps);
    }
    if (this.props.location !== nextProps.location) {
      this.setState({ active: false });
    }
  }
  _updateSearchTextFromUrl(props) {
    const components = props.location.pathname.split("/");
    if (components[components.length - 1] === "search") {
      this.setState({ searchText: props.location.query.q });
    } else {
      this.setState({ searchText: "" });
    }
  }

  render() {
    const { active, searchText } = this.state;
    return (
      <OnClickOutsideWrapper
        handleDismissal={() => this.setState({ active: false })}
      >
        <SearchWrapper
          onClick={() => this.setState({ active: true })}
          active={active}
        >
          <Icon name="search" ml={2} />
          <SearchInput
            w={1}
            py={2}
            pr={2}
            pl={1}
            value={searchText}
            placeholder={t`Search` + "…"}
            onClick={() => this.setState({ active: true })}
            onChange={e => this.setState({ searchText: e.target.value })}
            onKeyPress={e => {
              if (e.key === "Enter" && (searchText || "").trim().length > 0) {
                this.props.onChangeLocation({
                  pathname: "search",
                  query: { q: searchText },
                });
              }
            }}
          />
          {this.state.active && (
            <Box className="absolute full text-normal" style={{ top: 60 }}>
              <Card p={2} className="text-dark">
                {searchText.length > 0 ? (
                  <Box>
                    <h4>Results for {searchText}</h4>
                    <Search.ListLoader query={{ q: searchText }} wrapped reload>
                      {({ list }) => {
                        if (list.length === 0) {
                          return <Box>No results</Box>;
                        }
                        return list.map(l => (
                          <Box>
                            <Link to={l.getUrl()}>
                              <Flex align="center">
                                <Icon name={l.getIcon()} mr={2} />
                                <h4 className="text-brand">{l.name}</h4>
                              </Flex>
                            </Link>
                          </Box>
                        ));
                      }}
                    </Search.ListLoader>
                  </Box>
                ) : (
                  <Box>
                    <h4>Recently viewed</h4>
                    Coming soon...
                  </Box>
                )}
              </Card>
            </Box>
          )}
        </SearchWrapper>
      </OnClickOutsideWrapper>
    );
  }
}

const MODAL_NEW_DASHBOARD = "MODAL_NEW_DASHBOARD";

@Database.loadList({
  // set this to false to prevent a potential spinner on the main nav
  loadingAndErrorWrapper: false,
})
@connect(
  mapStateToProps,
  mapDispatchToProps,
)
export default class Navbar extends Component {
  state = {
    modal: null,
  };

  static propTypes = {
    context: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    user: PropTypes.object,
  };

  isActive(path) {
    return this.props.path.startsWith(path);
  }

  setModal(modal) {
    this.setState({ modal });
    if (this._newPopover) {
      this._newPopover.close();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location) {
      this.setState({ modal: null });
      if (this._newPopover) {
        this._newPopover.close();
      }
    }
  }

  renderAdminNav() {
    return (
      // NOTE: DO NOT REMOVE `Nav` CLASS FOR NOW, USED BY MODALS, FULLSCREEN DASHBOARD, ETC
      // TODO: hide nav using state in redux instead?
      <nav className={"Nav AdminNav sm-py1"}>
        <div className="sm-pl4 flex align-center pr1">
          <div className="NavTitle flex align-center">
            <Icon name={"gear"} className="AdminGear" size={22} />
            <span className="NavItem-text ml1 hide sm-show text-bold">{t`Metabase Admin`}</span>
          </div>

          <ul className="sm-ml4 flex flex-full">
            <AdminNavItem
              name={t`Settings`}
              path="/admin/settings"
              currentPath={this.props.path}
            />
            <AdminNavItem
              name={t`People`}
              path="/admin/people"
              currentPath={this.props.path}
            />
            <AdminNavItem
              name={t`Data Model`}
              path="/admin/datamodel"
              currentPath={this.props.path}
            />
            <AdminNavItem
              name={t`Databases`}
              path="/admin/databases"
              currentPath={this.props.path}
            />
            <AdminNavItem
              name={t`Permissions`}
              path="/admin/permissions"
              currentPath={this.props.path}
            />
            <AdminNavItem
              name={t`Troubleshooting`}
              path="/admin/troubleshooting"
              currentPath={this.props.path}
            />
          </ul>

          <ProfileLink {...this.props} />
        </div>
        {this.renderModal()}
      </nav>
    );
  }

  renderEmptyNav() {
    return (
      // NOTE: DO NOT REMOVE `Nav` CLASS FOR NOW, USED BY MODALS, FULLSCREEN DASHBOARD, ETC
      // TODO: hide nav using state in redux instead?
      <nav className="Nav sm-py1 relative">
        <ul className="wrapper flex align-center">
          <li>
            <Link
              to="/"
              data-metabase-event={"Navbar;Logo"}
              className="NavItem cursor-pointer flex align-center"
            >
              <LogoIcon className="text-brand my2" />
            </Link>
          </li>
        </ul>
        {this.renderModal()}
      </nav>
    );
  }

  renderMainNav() {
    const hasDataAccess =
      this.props.databases && this.props.databases.length > 0;
    return (
      <Flex
        // NOTE: DO NOT REMOVE `Nav` CLASS FOR NOW, USED BY MODALS, FULLSCREEN DASHBOARD, ETC
        // TODO: hide nav using state in redux instead?
        className="Nav relative bg-brand text-white z3 flex-no-shrink"
        align="center"
        py={1}
        pr={2}
      >
        <Link
          to="/"
          data-metabase-event={"Navbar;Logo"}
          className="relative cursor-pointer z2 rounded flex justify-center transition-background"
          p={1}
          mx={1}
          hover={{ backgroundColor: DefaultSearchColor }}
        >
          <LogoIcon dark />
        </Link>
        <Flex
          className="absolute top left right bottom z1"
          px={4}
          align="center"
        >
          <Box w={2 / 3}>
            <SearchBar
              location={this.props.location}
              onChangeLocation={this.props.onChangeLocation}
            />
          </Box>
        </Flex>
        <Flex ml="auto" align="center" className="relative z2">
          {hasDataAccess && (
            <Link
              to={Urls.newQuestion()}
              mx={2}
              className="hide sm-show"
              data-metabase-event={`NavBar;New Question`}
            >
              <Button medium>{t`Ask a question`}</Button>
            </Link>
          )}
          <EntityMenu
            tooltip={t`Create`}
            className="hide sm-show"
            triggerIcon="add"
            items={[
              {
                title: t`New dashboard`,
                icon: `dashboard`,
                action: () => this.setModal(MODAL_NEW_DASHBOARD),
                event: `NavBar;New Dashboard Click;`,
              },
              {
                title: t`New pulse`,
                icon: `pulse`,
                link: Urls.newPulse(),
                event: `NavBar;New Pulse Click;`,
              },
            ]}
          />
          {hasDataAccess && (
            <Tooltip tooltip={t`Reference`}>
              <Link to="reference" data-metabase-event={`NavBar;Reference`}>
                <IconWrapper>
                  <Icon name="reference" />
                </IconWrapper>
              </Link>
            </Tooltip>
          )}
          <Tooltip tooltip={t`Activity`}>
            <Link to="activity" data-metabase-event={`NavBar;Activity`}>
              <IconWrapper>
                <Icon name="bell" />
              </IconWrapper>
            </Link>
          </Tooltip>
          <ProfileLink {...this.props} />
        </Flex>
        {this.renderModal()}
      </Flex>
    );
  }

  renderModal() {
    const { modal } = this.state;
    if (modal) {
      return (
        <Modal onClose={() => this.setState({ modal: null })}>
          {modal === MODAL_NEW_DASHBOARD ? (
            <CreateDashboardModal
              createDashboard={this.props.createDashboard}
              onClose={() => this.setState({ modal: null })}
            />
          ) : null}
        </Modal>
      );
    } else {
      return null;
    }
  }

  render() {
    const { context, user } = this.props;

    if (!user) {
      return null;
    }

    switch (context) {
      case "admin":
        return this.renderAdminNav();
      case "auth":
        return null;
      case "none":
        return this.renderEmptyNav();
      case "setup":
        return null;
      default:
        return this.renderMainNav();
    }
  }
}
