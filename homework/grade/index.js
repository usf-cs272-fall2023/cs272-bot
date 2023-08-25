module.exports = async ({github, context, core}) => {
  try {
    const grade_output = core.getInput('grade_output');
    core.info(grade_output);
    // core.notice(`Earned ${grade_starting} from tests before any deductions`, {'title': `+${grade_starting} Points`});
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to calculate final grade after deductions.');
  }
};