module.exports = async ({github, context, core}) => {
  try {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body: `
  :stop_sign: @${context.actor} there was a problem with your request:

  > ${process.env.ERROR_MESSAGE}

  See [run ${context.runId}](${context.payload.repository.html_url}/actions/runs/${context.runId}) for details. After the problems have been addressed, remove the \`error\` label and re-open this issue.
      `
    });
    
    await github.rest.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      state: 'closed',
      labels: ['error'],
      assignees: [context.actor]
    });
  }
  catch (error) {
    core.exportVariable('ERROR_MESSAGE', error.message);
    core.setFailed(process.env.ERROR_MESSAGE);
  }
};