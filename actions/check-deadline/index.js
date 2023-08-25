module.exports = async ({core, exec, constants}) => {
  try {
    core.info(process.env.ASSIGNMENT_NAME);
    core.info(JSON.stringify(constants));
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the number of commits.');
  }
};