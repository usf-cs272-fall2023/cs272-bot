module.exports = async ({github, context, core, constants, DateTime, Settings}) => {
  try {
    const zone = 'America/Los_Angeles';
    const eod = 'T23:59:59';
    Settings.defaultZone = zone;

    const assignment_name = process.env.ASSIGNMENT_NAME;

    if (!(assignment_name in constants.deadlines)) {
      throw new Error(`Unrecognized assignment: ${assignment_name}`);
    }
  
    const assignment = constants.deadlines[assignment_name];

    console.log('');
    console.log(`Assignment: ${assignment_name}`);
  
    // process deadline and possible extension
    let deadline_date = DateTime.fromISO(`${assignment.due}${eod}`);
  
    if (!deadline_date.isValid) {
      throw new Error(`Unable to parse deadline date: ${assignment.due}${eod} (${deadline_date.invalidReason})`);
    }
  
    let deadline_text = deadline_date.toLocaleString(DateTime.DATETIME_FULL);
    console.log(`  Deadline: ${deadline_text}`);
 
  // process submitted date
  // something goes wrong with ISO dates that have : colon symbols; access directly from payload
  let submitted_date = undefined;

  try {
    if ('inputs' in github.context.payload && github.context.payload.inputs.submitted_date) {
      console.log(`     Input: ${github.context.payload.inputs.submitted_date}`);
      submitted_date = DateTime.fromISO(github.context.payload.inputs.submitted_date);
    }
    else if (`SUBMITTED_DATE` in process.env && process.env.SUBMITTED_DATE) {
      console.log(`     Input: ${process.env.SUBMITTED_DATE}`);
      submitted_date = DateTime.fromISO(process.env.SUBMITTED_DATE);
    }
    else {
      // try to use event payload for submitted date
      switch (github.context.eventName) {
        case 'push':
          // pushed_at is a timestamp for this event
          console.log(`    Pushed: ${github.context.payload.repository.pushed_at}`);
          submitted_date = DateTime.fromSeconds(parseInt(github.context.payload.repository.pushed_at));
          // committed date less reliable, use pushed date instead!
          // console.log(`    Commit: ${github.context.payload.head_commit.message}`);
          // submitted_date = DateTime.fromISO(github.context.payload.head_commit.timestamp);
          break;
        case 'release':
          // created_at is an ISO date for this event
          console.log(`   Release: ${github.context.payload.release.tag_name}`);
          submitted_date = DateTime.fromISO(github.context.payload.release.created_at);
          break;
        case 'workflow_dispatch':
          // pushed_at is an ISO date for this event
          console.log(`    Pushed: ${github.context.payload.repository.pushed_at}`);
          submitted_date = DateTime.fromISO(github.context.payload.repository.pushed_at);
          break;
        default:
          throw new Error(`Unexpected event type: ${github.context.eventName}`);
      }
    }

    if (!submitted_date.isValid) {
      throw new Error(`Could not parse date: ${ submitted_date.invalidReason}`);
    }
  }
  catch (error) {
    console.log('');
    core.warning(`Unable to determine submitted date; using current date and time. ${error}`);

    core.startGroup('Outputting context...');
    console.log(JSON.stringify(github.context));
    core.endGroup();
    console.log('');

    submitted_date = DateTime.now();
  }

  const submitted_text = submitted_date.toLocaleString(DateTime.DATETIME_FULL);
  console.log(` Submitted: ${submitted_text}\n`);

  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the deadline and calculate a late penalty.');
  }
};