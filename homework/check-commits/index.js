module.exports = async ({core, exec}) => {
  try {
    core.startGroup('Listing commits...');
    await exec.exec('git fetch --unshallow');
    await exec.exec('git log --oneline refs/remotes/origin/main');
    core.endGroup();

    let num_commits = '';
    await exec.exec('git rev-list --count refs/remotes/origin/main', {
      listeners: { stdout: (data: Buffer) => { num_commits = data.toString(); } }
    });

    num_commits = parseInt(num_commits);
    core.info(`Found at least ${num_commits} commits.`);
    
    // NUM_COMMITS=$(git rev-list --count refs/remotes/origin/main)
    // echo "NUM_COMMITS=${NUM_COMMITS}" >> $GITHUB_ENV
    // echo "num_commits=${NUM_COMMITS}" >> $GITHUB_OUTPUT
    // echo "::endgroup::"

    // echo ""
    // echo "Found Commits: ${NUM_COMMITS} (at least)"

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