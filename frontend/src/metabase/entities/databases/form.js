import React from "react";
import MetabaseSettings from "metabase/lib/settings";
import { t, jt } from "ttag";
import _ from "underscore";

const CREDS_URL = {
  bigquery:
    "https://console.developers.google.com/apis/credentials/oauthclient?project=",
  googleanalytics:
    "https://console.developers.google.com/apis/credentials/oauthclient?project=",
};

const AUTH_URL = {
  bigquery:
    "https://accounts.google.com/o/oauth2/auth?redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/bigquery&client_id=",
  bigquery_with_drive:
    "https://accounts.google.com/o/oauth2/auth?redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/bigquery%20https://www.googleapis.com/auth/drive&client_id=",
  googleanalytics:
    "https://accounts.google.com/o/oauth2/auth?access_type=offline&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&client_id=",
};

const ENABLE_API_URL = {
  googleanalytics:
    "https://console.developers.google.com/apis/api/analytics.googleapis.com/overview?project=",
};

const FIELD_OVERRIDES = {
  "details.use-jvm-timezone": values => ({
    // "display-name": t`Use the Java Virtual Machine (JVM) timezone`,
    description: t`We suggest you leave this off unless you're doing manual timezone casting in
      many or most of your queries with this data.`,
  }),
  "details.tunnel-enabled": values => ({
    // "display-name": t`Use an SSH-tunnel for database connections`,
    description: t`Some database installations can only be accessed by connecting through an SSH bastion host.
      This option also provides an extra layer of security when a VPN is not available.
      Enabling this is usually slower than a direct connection.`,
  }),
  "client-id": ({ engine, details = {} }) => ({
    description: CREDS_URL[engine] && (
      <div>
        {jt`${clickHere(
          CREDS_URL[engine] + (details["project-id"] || ""),
        )} to generate a Client ID and Client Secret for your project.`}{" "}
        {t`Choose "Other" as the application type. Name it whatever you'd like.`}
      </div>
    ),
  }),
  "auth-code": ({ engine, details = {} }) => ({
    description: AUTH_URL[engine] && details["client-id"] && (
      <div>
        {jt`${clickHere(
          AUTH_URL[engine] + details["client-id"],
        )} to get an auth code`}
        {engine === "bigquery" &&
          jt` or ${clickHere(
            AUTH_URL["bigquery_with_drive"] + details["client-id"],
            t`with Google Drive permissions`,
          )}`}
        .
        {ENABLE_API_URL[engine] && clientIdToProjectId(details["client-id"]) && (
          <div className="mt1">
            {t`To use Metabase with this data you must enable API access in the Google Developers Console. `}
            {jt`${clickHere(
              ENABLE_API_URL[engine] +
                clientIdToProjectId(details["client-id"]),
            )} to go to the console if you haven't already done so.`}
          </div>
        )}
      </div>
    ),
  }),
};

const clickHere = (href, children = t`Click here`) => (
  <a className="link" target="_blank" href={href}>
    {children}
  </a>
);

const clientIdToProjectId = clientId =>
  ((clientId || "").match(/^\d+/) || [])[0];

function getFieldsForEngine(engine, values) {
  const info = (MetabaseSettings.get("engines") || {})[engine];
  if (info) {
    const fields = [];
    const disabledPrefixes = [];
    for (const field of info["details-fields"]) {
      // skip ssl since we auto-detect this
      if (field.name === "ssl") {
        continue;
      }
      // automatically hides fields matching the prefix of boolean fields like `*-enabled`
      // e.x. `tunnel-enabled` will show/hide `tunnel-host` etc
      const match = field.name.match(/^(.*-)enabled$/);
      if (match && (!values.details || !values.details[field.name])) {
        disabledPrefixes.push(match[1]);
      } else if (_.any(disabledPrefixes, p => field.name.startsWith(p))) {
        continue;
      }

      const overrides =
        FIELD_OVERRIDES[field.name] && FIELD_OVERRIDES[field.name](values);

      fields.push({
        name: "details." + field.name,
        title: field["display-name"],
        type: field.type,
        placeholder: field.placeholder || field.default,
        ...(overrides || {}),
        validate: value => (field.required && !value ? `required` : null),
        normalize: value =>
          value == "" || value == null
            ? "default" in field
              ? field.default
              : null
            : value,
      });
    }
    return fields;
  } else {
    return [];
  }
}

const ENGINE_OPTIONS = Object.entries(
  MetabaseSettings.get("engines") || {},
).map(([engine, info]) => ({
  name: info["driver-name"],
  value: engine,
}));

export default {
  fields: (values = {}, ...args) =>
    console.log(args) || [
      {
        name: "engine",
        title: t`Database Type`,
        type: "select",
        options: ENGINE_OPTIONS,
        placeholder: `Select a database`,
        initial: "postgres",
      },
      {
        name: "name",
        placeholder: `How would you like to refer to this database?`,
        validate: value => (!value ? `required` : null),
      },
      ...getFieldsForEngine(values.engine, values),
      {
        name: "details.let-user-control-scheduling",
        type: "boolean",
        title: t`Let me choose when Metabase syncs and scans`,
        description: t`By default, Metabase does a lightweight hourly sync and an intensive daily scan of field values.
        If you have a large database, we recommend turning this on and reviewing when and how often the field value scans happen.`,
      },
    ],
};
