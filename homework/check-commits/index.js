module.exports = async ({core, exec}) => {
  try {
    core.startGroup('Listing commits...');
    await exec.exec('git fetch --unshallow');
    await exec.exec('git log --oneline refs/remotes/origin/main');
    core.endGroup();

    // capture output for number of commits
    let num_commits = '';
    
    const options = {};
    options.listeners = {
      stdout: (data: Buffer) => {
        num_commits = data.toString().trim();
      }
    };

    await exec.exec('git rev-list --count refs/remotes/origin/main', options);

    num_commits = parseInt(num_commits);
    core.info(`Found at least ${num_commits} commits.`);

    const min_commits = parseInt(process.env.MIN_COMMITS);
    // const num_commits = parseInt(process.env.NUM_COMMITS);

    // if (num_commits < min_commits) {
      core.error(`Found only ${num_commits} commit(s)... at least ${min_commits} commits are required.`, {'title': '-5 Points'});
      process.exitCode = 1;
    // }
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the number of commits.', {'title': 'Error'});
  }
};