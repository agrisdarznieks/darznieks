import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "oqf42bbg",
    dataset: "production",
  },
  studioHost: "darznieks",
  deployment: {
    appId: "h9ivpe5lfkjvrcukggn7oa4n",
    autoUpdates: true,
  },
});
