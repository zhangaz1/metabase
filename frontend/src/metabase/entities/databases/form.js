import MetabaseSettings from "metabase/lib/settings";
import { t } from "ttag";

const FIELD_OVERRIDES = {
  "details.use-jvm-timezone": {
    // "display-name": t`Use the Java Virtual Machine (JVM) timezone`,
    description: t`We suggest you leave this off unless you're doing manual timezone casting in
      many or most of your queries with this data.`,
  },
  "details.tunnel-enabled": {
    // "display-name": t`Use an SSH-tunnel for database connections`,
    description: t`Some database installations can only be accessed by connecting through an SSH bastion host.
      This option also provides an extra layer of security when a VPN is not available.
      Enabling this is usually slower than a direct connection.`,
  },
};

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
      fields.push({
        name: "details." + field.name,
        title: field["display-name"],
        type: field.type,
        placeholder: field.placeholder || field.default,
        ...(FIELD_OVERRIDES[field.name] || {}),
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
