module.exports = async ({github, context, core, exec}) => {
  try {
    const min_commits = parseInt(process.env.MIN_COMMITS);
    const num_commits = parseInt(process.env.NUM_COMMITS);

    // if (num_commits == min_commits) {
      core.setFailed(`Found only ${num_commits} commit(s)... at least ${min_commits} commits are required.`, {'title': '-5 Points'});
    // }
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the number of commits.', {'title': 'Error'});
  }
};