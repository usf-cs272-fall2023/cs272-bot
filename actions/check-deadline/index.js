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
    console.log(`Assignment: ${assignment_name}`);
  
    // process deadline and possible extension
    let deadline_date = DateTime.fromISO(`${assignment.due}${eod}`);
  
    if (!deadline_date.isValid) {
      throw new Error(`Unable to parse deadline date: ${assignment.due}${eod} (${deadline_date.invalidReason})`);
    }
  
    let deadline_text = deadline_date.toLocaleString(DateTime.DATETIME_FULL);
    console.log(`  Deadline: ${deadline_text}`);
 
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check the deadline and calculate a late penalty.');
  }
};