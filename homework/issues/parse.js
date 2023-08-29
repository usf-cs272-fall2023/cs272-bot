module.exports = async ({github, context, core}) => {
  try {
    core.info(`Parsing issue body...`);
    const body = context.payload.issue.body;

    const issue_regex = /^### Full Name\s+([^\r\n]+)\s+### USF Email\s+([^\r\n]+)\b\s*$/;
    const issue_match = body.match(issue_regex);
    core.info(issue_match);
    core.info('');

    // check for unexpected match results
    if (issue_match == null || issue_match.length != 3) {
      core.info(`Issue Match: ${issue_match}`);
      core.exportVariable('ERROR_MESSAGE', `Unable to parse issue body. Error: ${error.message}`);
      core.setFailed(process.env.ERROR_MESSAGE);
      return;
    }
    
    const parsed = {
      'name': issue_match[1],
      'email': issue_match[2],
    };

    core.info(JSON.stringify(parsed));
    core.info('');

    // check that it is a USF email (e.g. sjengle@usfca.edu or sjengle@cs.usfca.edu)
    const email_regex = /^([^@]+)@(?:[^@]*\.)?usfca.edu$/;
    const email_match = parsed.email.toLowerCase().match(email_regex);

    if (email_match == null || email_match.length != 2) {
      core.info(`Email Match: ${email_match}`);

      core.exportVariable('ERROR_MESSAGE', `The email ${parsed.email} does not appear to be a USF email.`);
      core.setFailed(process.env.ERROR_MESSAGE);
      return;
    }

    // check that it is one of the known users
    const username = email_match[1];
    const known_users = process.env.KNOWN_USERS;

    if (!known_users) {
      core.info('Skipping check for known users...');
    }
    else if (!known_users.includes(username)) {
      core.exportVariable('ERROR_MESSAGE', `Username ${username} is unknown. Check the email address for typos.`);
      core.setFailed(process.env.ERROR_MESSAGE);
      return;
    }

    return JSON.stringify(parsed);
  }
  catch (error) {
    core.exportVariable('ERROR_MESSAGE', error.message);
    core.setFailed(process.env.ERROR_MESSAGE);
  }
};