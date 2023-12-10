module.exports = async ({github, context, core}) => {
  const error_messages = [];

  try {
    const {RELEASES, COMMENT_ID} = process.env;
    let markdown = `
# CS 272 Project Statistics

:octocat: Hello @${ context.actor }! You can find your project statistics below.

    `;

    if (RELEASES.hasOwnProperty('project1')) {

    }

    await core.summary.addRaw(markdown).write();
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
      core.info(`${property}: ${output[property]}`);
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