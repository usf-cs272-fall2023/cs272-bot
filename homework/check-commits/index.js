module.exports = async ({github, context, core, exec}) => {
  try {
    // list recent commits
    core.info('Listing commits...');
    await exec.exec('git', ['fetch', '--unshallow']);
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the number of commits.');
  }
};