module.exports = async ({core, exec}) => {
  try {
    core.startGroup('Listing commits...');
    await exec.exec('git fetch --unshallow');
    await exec.exec('git log --oneline refs/remotes/origin/main');

    const min_commits = parseInt(process.env.MIN_COMMITS);
    const options = {};
    let num_commits = '';

    options.listeners = {
      stdout: (data) => {
        // capture output for number of commits
        num_commits = parseInt(data.toString().trim());
      }
    };

    const result = await exec.exec('git rev-list --count refs/remotes/origin/main', '', options);
    core.info(result);
    core.endGroup();

    core.info(`Found at least ${num_commits} commits (${min_commits} required).`);
    core.setOutput('num_commits', num_commits);
    core.setOutput('min_commits', min_commits);

    process.exitCode = num_commits < min_commits ? 1 : 0;
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the number of commits.');
  }
};