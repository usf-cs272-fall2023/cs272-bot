module.exports = async ({github, context, core, fetch, AdmZip}) => {
  try {
    core.info("Hello world");

    core.info(process.env.ACCESS_TOKEN);
    core.info(process.env.ARTIFACT_NAME);
    core.info(process.env.ARTIFACT_JSON);
    core.info(process.env.WORKFLOW_NAME);
    core.info(process.env.WORKFLOW_RUN);
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the deadline and calculate a late penalty.');
  }
};