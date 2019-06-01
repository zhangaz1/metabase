/* @flow */
import React, { Component } from "react";
import { t } from "ttag";
import { Box, Flex } from "grid-styled";

import User from "metabase/entities/users";
import Form from "metabase/containers/Form";

import Radio from "metabase/components/Radio";
import UserAvatar from "metabase/components/UserAvatar";

type Props = {
  tab: string,
  user: {},
  setTab: (tab: string) => void,
  updatePassword: (details: {}) => Promise<any>,
};

export default class UserSettings extends Component {
  props: Props;

  render() {
    const { tab, user, setTab, updatePassword } = this.props;

    return (
      <Box>
        <Flex
          bg="white"
          align="center"
          justifyContent="center"
          flexDirection="column"
          className="border-bottom"
          pt={[1, 2]}
        >
          <Flex
            align="center"
            justifyContent="center"
            flexDirection="column"
            p={[2, 2, 4]}
          >
            <UserAvatar user={user} mb={[1, 2]} size={["3em", "4em", "5em"]} />
            <h2>{t`Account settings`}</h2>
          </Flex>

          <Radio
            value={tab}
            underlined={true}
            options={[
              { name: t`Profile`, value: "details" },
              {
                name: t`Password`,
                value: "password",
              },
            ]}
            onChange={tab => setTab(tab)}
          />
        </Flex>
        <Box w={["100%", 540]} ml="auto" mr="auto" px={[1, 2]} pt={[1, 3]}>
          {tab === "details" ? (
            <User.Form {...this.props} formName="user" />
          ) : tab === "password" ? (
            <Form
              submitTitle={t`Update`}
              onSubmit={details => updatePassword(details)}
              form={{
                fields: [
                  {
                    name: "current_password",
                    title: t`Current password`,
                    type: "password",
                    validate: currentPassword =>
                      !currentPassword && t`Please enter your current password`,
                  },
                  {
                    name: "password",
                    title: t`New password`,
                    type: "password",
                  },
                  {
                    name: "confirm_new_password",
                    title: t`Confirm new password`,
                    type: "password",
                  },
                ],
              }}
            />
          ) : null}
        </Box>
      </Box>
    );
  }
}
