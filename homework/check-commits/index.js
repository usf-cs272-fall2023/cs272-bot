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

    if (num_commits < min_commits) {
      core.error(`Found only ${num_commits} commit(s)... at least ${min_commits} commits are required.`, {'title': '-5 Points'});
      process.exitCode = 1;
    }
    
    core.info(`Found at least ${num_commits} commits.`);
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the number of commits.');
  }
};