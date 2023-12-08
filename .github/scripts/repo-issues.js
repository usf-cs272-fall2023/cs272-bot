module.exports = async ({octokit, context, core}) => {
  const error_messages = [];
  const output = {};

  try {
    const request = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'all'
    };

    const issues = octokit.paginate.iterator(octokit.rest.issues.listForRepo, request);

    // https://octokit.github.io/rest.js/v20#pagination
    for await (const response of issues) {
      core.info(JSON.stringify(response));
      break; // TODO just test if loop works
    }

  }
  catch (error) {
    // add error and output stack trace
    error_messages.push(`Error: ${error.message}`);

    core.info('');
    core.startGroup(`Encountered ${error.name}...`);
    core.info(error.message);
    core.info(error.stack);
    core.endGroup();
  }
  finally {
    // output and set results
    core.startGroup('Setting output...');
    for (const property in output) {
      console.log(`${property}: ${output[property]}`);
      core.setOutput(property, output[property]);
    }
    core.endGroup();

    // save and output all errors
    if (error_messages.length > 0) {
      const formatted = error_messages.map(x => `  1. ${x}\n`).join('');
      core.setOutput('error_messages', formatted);

      core.startGroup(`Outputting errors...`);
      for (const message of error_messages) {
        core.error(message);
      }
      core.endGroup();

      core.setFailed(`Found ${error_messages.length} problems.`);
    }
  }
};