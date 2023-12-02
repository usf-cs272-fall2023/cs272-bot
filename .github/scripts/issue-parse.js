// parses the issue title and body for request details
module.exports = async ({github, context, core}) => {
  const error_messages = [];
  const output = {};

  try {
    const title = context.payload.issue.title; 
    const body = context.payload.issue.body;
  
    // parse issue title
    switch (title) {
      case 'Request Project Tests Grade':
        output.request_type = 'grade_tests';
        break;

      case 'Request Project Review Grade':
        output.request_type = 'grade_review';
        break;

      case 'Request Project Design Grade':
        output.request_type = 'grade_design';
        break;

      case 'Request Project Code Review':
        output.request_type = 'request_review';
        break;

      default:
        error_messages.push(`Unable to determine request type from issue title: ${title}`);
    }

    // parse issue body 
    const pattern = /^### Full Name\s+([^\r\n]+)\s+### USF Email\s+([^\r\n]+)\s+### Release\s+([^\r\n]+)\b\s*$/;
    const matched = body.match(pattern);

    if (matched === null || matched.length !== 4) {
      console.log(matched);
      error_messages.push(`Unable to parse details from issue body.`);
      return; // don't continue try block
    }

    output.name = matched[1].trim();
    output.email = matched[2].trim();
    output.release = matched[3].trim();

    core.info(`Parsed: ${JSON.stringify(output)}`);

    // attempt to parse the release
    const tag_regex = /^v([1-5])\.(\d+)\.(\d+)$/;
    const tag_match = output.release.match(tag_regex);

    if (tag_match === null || tag_match.length !== 4) {
      error_messages.push(`Unable to parse "${output.release}" into major, minor, and patch version numbers.`);
      return;
    }

    output.version_major = parseInt(tag_match[1]);
    output.version_minor = parseInt(tag_match[2]);
    output.version_patch = parseInt(tag_match[3]);
    output.release_tag  = `v${output.version_major}.${output.version_minor}.${output.version_patch}`;

    // check that it is a USF email (e.g. sjengle@usfca.edu or sjengle@cs.usfca.edu)
    const email_regex = /^([^@]+)@(?:[^@]*\.)?usfca.edu$/;
    const email_match = output.email.toLowerCase().match(email_regex);

    if (email_match == null || email_match.length != 2) {
      core.info(`Email Match: ${email_match}`);
      error_messages.push(`The email ${output.email} does not appear to be a USF email.`);
      return;
    }
    
    // check that it is one of the known users
    const username = email_match[1];
    const known_users = process.env.KNOWN_USERS;

    if (!known_users) {
      core.info('Skipping check for known users...');
    }
    else if (!known_users.includes(username)) {
      error_messages.push(`Username ${username} is unknown. Check the email address for typos.`);
      return;
    }
  }
  catch (error) {
    // add error and output stack trace
    error_messages.push(`Unexpected error: ${error.message}`);

    core.info('');
    core.startGroup(`Unexpected ${error.name} encountered...`);
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

      core.setFailed(`Found ${error_messages.length} problems while parsing the request.`);
    }
  }
};