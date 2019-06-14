import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import _ from "underscore";
import { t, jt } from "ttag";
import FormField from "metabase/components/form/FormField.jsx";
import FormLabel from "metabase/components/form/FormLabel.jsx";
import FormMessage from "metabase/components/form/FormMessage.jsx";
import Toggle from "metabase/components/Toggle.jsx";

import { shallowEqual } from "recompose";

const AUTH_URL_PREFIXES = {
  bigquery:
    "https://accounts.google.com/o/oauth2/auth?redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/bigquery&client_id=",
  bigquery_with_drive:
    "https://accounts.google.com/o/oauth2/auth?redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/bigquery%20https://www.googleapis.com/auth/drive&client_id=",
  googleanalytics:
    "https://accounts.google.com/o/oauth2/auth?access_type=offline&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&client_id=",
};

const ENABLE_API_PREFIXES = {
  googleanalytics:
    "https://console.developers.google.com/apis/api/analytics.googleapis.com/overview?project=",
};

const CREDENTIALS_URL_PREFIXES = {
  bigquery:
    "https://console.developers.google.com/apis/credentials/oauthclient?project=",
  googleanalytics:
    "https://console.developers.google.com/apis/credentials/oauthclient?project=",
};

const FIELD_OVERRIDES = {
  "use-jvm-timezone": {
    "display-name": t`Use the Java Virtual Machine (JVM) timezone`,
    description: t`We suggest you leave this off unless you're doing manual timezone casting in
      many or most of your queries with this data.`,
  },
  "tunnel-enabled": {
    "display-name": t`Use an SSH-tunnel for database connections`,
    description: t`Some database installations can only be accessed by connecting through an SSH bastion host.
      This option also provides an extra layer of security when a VPN is not available.
      Enabling this is usually slower than a direct connection.`,
  },
  "let-user-control-scheduling": {
    "display-name": t`This is a large database, so let me choose when Metabase syncs and scans`,
    description: t`By default, Metabase does a lightweight hourly sync and an intensive daily scan of field values.
      If you have a large database, we recommend turning this on and reviewing when and how often the field value scans happen.`,
  },
};

/**
 * This is a form for capturing database details for a given `engine` supplied via props.
 * The intention is to encapsulate the entire <form> with standard MB form styling and allow a callback
 * function to receive the captured form input when the form is submitted.
 */
export default class DatabaseDetailsForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      details: props.details || {},
      valid: false,
    };
  }

  static propTypes = {
    details: PropTypes.object,
    engine: PropTypes.string.isRequired,
    engines: PropTypes.object.isRequired,
    formError: PropTypes.object,
    hiddenFields: PropTypes.object,
    isNewDatabase: PropTypes.boolean,
    submitButtonText: PropTypes.string.isRequired,
    submitFn: PropTypes.func.isRequired,
    submitting: PropTypes.boolean,
  };

  getFields() {
    const { engine, engines } = this.props;
    return [
      {
        name: "name",
        "display-name": t`Name`,
        placeholder: t`How would you like to refer to this database?`,
        required: true,
      },
      ...engines[engine]["details-fields"],
      {
        name: "let-user-control-scheduling",
        type: "boolean",
      },
    ];
  }

  // automatically hides fields matching the prefix of boolean fields like `*-enabled`
  // e.x. `tunnel-enabled` will show/hide `tunnel-host` etc
  getVisibleFields() {
    const { hiddenFields = {} } = this.props;
    const { details } = this.state;
    const fields = this.getFields();
    const hiddenPrefixes = [];
    return fields.filter(field => {
      // assumes `-enabled` field comes before any other prefixed fields it would disable
      const match = field.name.match(/^(.*-)enabled$/);
      if (match && !details[field.name]) {
        hiddenPrefixes.push(match[1]);
        return !hiddenFields[field.name];
      } else {
        return (
          !hiddenFields[field.name] &&
          !_.any(hiddenPrefixes, prefix => field.name.startsWith(prefix))
        );
      }
    });
  }

  validateForm() {
    const { details } = this.state;

    let valid = true;
    // go over individual fields (hidden fields aren't required)
    for (const field of this.getVisibleFields()) {
      if (
        field.required &&
        (details[field.name] == null || details[field.name] == "")
      ) {
        valid = false;
        break;
      }
    }
    if (this.state.valid !== valid) {
      this.setState({ valid });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(this.props.details, nextProps.details)) {
      this.setState({ details: nextProps.details });
    }
  }

  componentDidMount() {
    this.validateForm();
  }

  componentDidUpdate() {
    this.validateForm();
  }

  onChange(fieldName, fieldValue) {
    this.setState({
      details: { ...this.state.details, [fieldName]: fieldValue },
    });
  }

  formSubmitted(e) {
    e.preventDefault();

    const { engine, engines, submitFn } = this.props;
    const { details } = this.state;

    const request = {
      engine: engine,
      name: details.name,
      details: {},
      // use the existing is_full_sync setting in case that "let user control scheduling" setting is enabled
      is_full_sync: details.is_full_sync,
    };

    for (const field of engines[engine]["details-fields"]) {
      let val = details[field.name] === "" ? null : details[field.name];

      if (val && field.type === "integer") {
        val = parseInt(val);
      }
      if (val == null && field.default) {
        val = field.default;
      }

      request.details[field.name] = val;
    }

    // NOTE Atte Keinänen 8/15/17: Is it a little hacky approach or not to add to the `details` field property
    // that are not part of the details schema of current db engine?
    request.details["let-user-control-scheduling"] =
      details["let-user-control-scheduling"];

    submitFn(request);
  }

  renderFieldInput(field, fieldIndex) {
    const { details } = this.state;
    return (
      <input
        type={field.type === "password" ? "password" : "text"}
        className="Form-input Form-offset full"
        name={field.name}
        value={details[field.name] || ""}
        placeholder={field.default || field.placeholder}
        onChange={e => this.onChange(field.name, e.target.value)}
        required={field.required}
        autoFocus={fieldIndex === 0}
      />
    );
  }

  renderField(field, fieldIndex) {
    const { engine } = this.props;
    const { details } = this.state;

    field = { ...field, ...(FIELD_OVERRIDES[field.name] || {}) };

    if (field.name === "client-id" && CREDENTIALS_URL_PREFIXES[engine]) {
      const { details } = this.state;
      const projectID = details && details["project-id"];
      // if (projectID) {
      const credentialsURL =
        CREDENTIALS_URL_PREFIXES[engine] + (projectID || "");
      const credentialsURLLink = (
        <div className="flex align-center Form-offset">
          <div className="Grid-cell--top">
            {jt`${(
              <a className="link" href={credentialsURL} target="_blank">
                {t`Click here`}
              </a>
            )} to generate a Client ID and Client Secret for your project.`}{" "}
            {t`Choose "Other" as the application type. Name it whatever you'd like.`}
          </div>
        </div>
      );
      // }

      return (
        <FormField key="client-id" field-name="client-id">
          <FormLabel title={field["display-name"]} field-name="client-id" />
          {credentialsURLLink}
          {this.renderFieldInput(field, fieldIndex)}
        </FormField>
      );
    } else if (field.name === "auth-code" && AUTH_URL_PREFIXES[engine]) {
      const { details } = this.state;
      const clientID = details && details["client-id"];
      let authURLLink;
      if (clientID) {
        const authURL = AUTH_URL_PREFIXES[engine] + clientID;
        authURLLink = (
          <div className="flex align-center Form-offset">
            <div className="Grid-cell--top">
              {jt`${(
                <a className="link" href={authURL} target="_blank">
                  {t`Click here`}
                </a>
              )} to get an auth code`}
              {engine === "bigquery" && (
                <span>
                  {" "}
                  (or{" "}
                  <a
                    href={AUTH_URL_PREFIXES["bigquery_with_drive"] + clientID}
                    target="_blank"
                  >{t`with Google Drive permissions`}</a>
                  )
                </span>
              )}
            </div>
          </div>
        );
      }

      // for Google Analytics we need to show a link for people to go to the Console to enable the GA API
      let enableAPILink;
      // projectID is just the first numeric part of the clientID.
      // e.g. clientID might be 123436115855-q8z42hilmjf8iplnnu49n7jbudmxxdf.apps.googleusercontent.com
      // then projecID would be 12343611585
      const projectID = clientID && (clientID.match(/^\d+/) || [])[0];
      if (ENABLE_API_PREFIXES[engine] && projectID) {
        // URL looks like https://console.developers.google.com/apis/api/analytics.googleapis.com/overview?project=12343611585
        const enableAPIURL = ENABLE_API_PREFIXES[engine] + projectID;
        enableAPILink = (
          <div className="flex align-center Form-offset">
            <div className="Grid-cell--top">
              {t`To use Metabase with this data you must enable API access in the Google Developers Console.`}
            </div>
            <div className="Grid-cell--top ml1">
              {jt`${(
                <a href={enableAPIURL} target="_blank">
                  {t`Click here`}
                </a>
              )} to go to the console if you haven't already done so.`}
            </div>
          </div>
        );
      }

      return (
        <FormField key="auth-code" field-name="auth-code">
          <FormLabel title={field["display-name"]} field-name="auth-code" />
          {authURLLink}
          {this.renderFieldInput(field, fieldIndex)}
          {enableAPILink}
        </FormField>
      );
    } else if (field.type === "boolean") {
      const on = details[field.name] == undefined ? false : details[field.name];
      return (
        <FormField key={field.name} fieldName={field.name}>
          <div className="flex align-center Form-offset">
            <div className="Grid-cell--top">
              <Toggle
                value={on}
                onChange={val => this.onChange(field.name, val)}
              />
            </div>
            <div className="px2">
              <h3>{field["display-name"]}</h3>
              {field.description && (
                <div style={{ maxWidth: "40rem" }} className="pt1">
                  {field.description}
                </div>
              )}
            </div>
          </div>
        </FormField>
      );
    } else {
      return (
        <FormField key={field.name} fieldName={field.name}>
          <FormLabel title={field["display-name"]} fieldName={field.name} />
          {this.renderFieldInput(field, fieldIndex)}
          <span className="Form-charm" />
        </FormField>
      );
    }
  }

  render() {
    const {
      formError,
      formSuccess,
      submitButtonText,
      isNewDatabase,
      submitting,
    } = this.props;
    const { valid, details } = this.state;

    const willProceedToNextDbCreationStep =
      isNewDatabase && details["let-user-control-scheduling"];

    const visibleFields = this.getVisibleFields();

    return (
      <form onSubmit={this.formSubmitted.bind(this)} noValidate>
        <div className="FormInputGroup pb2">
          {visibleFields.map((field, fieldIndex) =>
            this.renderField(field, fieldIndex),
          )}
        </div>

        <div className="Form-actions">
          <button
            className={cx("Button", { "Button--primary": valid })}
            disabled={!valid || submitting}
          >
            {submitting
              ? t`Saving...`
              : willProceedToNextDbCreationStep
              ? t`Next`
              : submitButtonText}
          </button>
          <FormMessage formError={formError} formSuccess={formSuccess} />
        </div>
      </form>
    );
  }
}
