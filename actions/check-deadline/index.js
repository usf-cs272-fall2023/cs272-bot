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
      if ('inputs' in context.payload && context.payload.inputs.submitted_date) {
        console.log(`     Input: ${context.payload.inputs.submitted_date}`);
        submitted_date = DateTime.fromISO(context.payload.inputs.submitted_date);
      }
      else if (`SUBMITTED_DATE` in process.env && process.env.SUBMITTED_DATE) {
        console.log(`     Input: ${process.env.SUBMITTED_DATE}`);
        submitted_date = DateTime.fromISO(process.env.SUBMITTED_DATE);
      }
      else {
        // try to use event payload for submitted date
        switch (context.eventName) {
          case 'push':
            // pushed_at is a timestamp for this event
            console.log(`    Pushed: ${context.payload.repository.pushed_at}`);
            submitted_date = DateTime.fromSeconds(parseInt(context.payload.repository.pushed_at));
            break;
          case 'release':
            // created_at is an ISO date for this event
            console.log(`   Release: ${context.payload.release.tag_name}`);
            submitted_date = DateTime.fromISO(context.payload.release.created_at);
            break;
          case 'workflow_dispatch':
            // pushed_at is an ISO date for this event
            console.log(`    Pushed: ${context.payload.repository.pushed_at}`);
            submitted_date = DateTime.fromISO(context.payload.repository.pushed_at);
            break;
          default:
            throw new Error(`Unexpected event type: ${context.eventName}`);
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
      console.log(JSON.stringify(context));
      core.endGroup();
      console.log('');

      submitted_date = DateTime.now();
    }

    const submitted_text = submitted_date.toLocaleString(DateTime.DATETIME_FULL);
    console.log(` Submitted: ${submitted_text}\n`);

    // process possible and starting points
    const possible_points = parseFloat(assignment.max);

    const points_text = process.env.POINTS; // earned/possible
    const starting_points = parseFloat(points_text.split("/", 1)[0].trim());

    if (!(possible_points > 0)) {
      throw new Error(`Possible points must be positive: ${possible_points}`);
    }

    if (!(starting_points) > 0) {
      throw new Error(`Starting points must be positive: ${starting_points}`);
    }

    console.log(`  Possible: ${possible_points} Points`);
    console.log(`  Starting: ${starting_points} Points\n`);

    let late_interval   = 0;
    let late_multiplier = 0;
    let late_percent    = 0;
    let late_points     = 0;

    if (submitted_date > deadline_date) {
      // calculate late penalties
      const late_penalty = Number.parseFloat(constants.penalty.percent * possible_points).toFixed(1);
      const late_maximum = Number.parseFloat(constants.penalty.maximum * possible_points).toFixed(1);

      console.log(`  Penalty: -${late_penalty} Points (-${constants.penalty.percent * 100}%) Per ${constants.penalty.interval} Hours Late`);
      console.log(`  Maximum: -${late_maximum} Points (-${constants.penalty.maximum * 100}%)\n`);

      // calculate late grade (okay if so close to deadline that rounding eliminates penalty)
      const late_diff = submitted_date.diff(deadline_date, 'hours');
      late_interval   = Number.parseFloat(late_diff.toObject().hours).toFixed(1);
      late_multiplier = Math.ceil(late_interval / constants.penalty.interval);

      late_points = Math.min(late_maximum, late_multiplier * late_penalty);
      late_percent = Number.parseFloat(late_points / possible_points * 100).toFixed(1);

      console.log(`  Duration: ${late_interval} Hours Late (x${late_multiplier})`);
      console.log(` Deduction: -${late_points} Points (-${late_percent}%)\n`);
    }

    // calculate earned grade (make sure not negative)
    let grade_points  = Math.max(starting_points - late_points, 0);
    let grade_percent = Number.parseFloat(grade_points / possible_points * 100).toFixed(1);

    console.log(`    Earned: ${grade_points} Points (${grade_percent}%)\n`);

    // set output
    const output = {
      'assignment_name': `${assignment_name}`,
      'grade_possible': `${possible_points}`,
      'grade_starting': `${starting_points}`,
      'deadline_date': deadline_date.toISO(),
      'deadline_text': deadline_text,
      'submitted_date': submitted_date.toISO(),
      'submitted_text': submitted_text,
      'late_interval': `${late_interval}`,
      'late_multiplier': `${late_multiplier}`,
      'late_percent': `${late_percent}`,
      'late_points': `${late_points}`,
      'grade_percent': `${grade_percent}`,
      'grade_points': `${grade_points}`,
      'workflow_run': `${context.runId}`
    };

    core.startGroup('Setting output...');
    for (const property in output) {
      console.log(`${property}: ${output[property]}`);
      core.setOutput(property, output[property]);
    }
    core.endGroup();
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the deadline and calculate a late penalty.');
  }
};