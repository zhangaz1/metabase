import React from "react";

import {
  getFormValues,
  fillAndSubmitForm,
  clickButton,
} from "__support__/enzyme_utils";
import { mountWithStore } from "__support__/integration_tests";

import UserSettings from "metabase/user/components/UserSettings";

const MOCK_USER = {
  first_name: "Testy",
  last_name: "McTestFace",
  email: "test@metabase.com",
};

describe("UserSettings", () => {
  describe("details", () => {
    it("should show user info", async () => {
      const { wrapper } = mountWithStore(
        <UserSettings
          user={MOCK_USER}
          tab="details"
          setTab={jest.fn()}
          updatePassword={jest.fn()}
        />,
      );

      const form = await wrapper.async.find("EntityForm");
      const values = await getFormValues(form);

      expect(values).toEqual(MOCK_USER);
    });
  });
  describe("password", () => {
    it("should render the form", () => {
      const { wrapper } = mountWithStore(
        <UserSettings
          user={MOCK_USER}
          tab="password"
          setTab={jest.fn()}
          updatePassword={jest.fn()}
        />,
      );

      const passwords = wrapper.find("input[type='password']");
      expect(passwords.length).toBe(3);
    });
    it("should submit a new password", async () => {
      const updateSpy = jest.fn();
      const { wrapper } = mountWithStore(
        <UserSettings
          user={MOCK_USER}
          tab="password"
          setTab={jest.fn()}
          updatePassword={updateSpy}
        />,
      );

      const newPass = {
        old_password: "abc123",
        password: "g00dp@ass",
      };

      await fillAndSubmitForm(newPass, wrapper);

      console.log(wrapper.debug());

      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
