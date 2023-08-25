module.exports = async ({github, context, core}) => {
  try {
    const grade_starting = parseFloat(process.env.GRADE_STARTING);

    // output points earned from tests before handle deductions
    core.notice(`Earned ${grade_starting} from tests before any deductions`, {'title': `+${grade_starting} Points`});

    let grade_points = parseFloat(process.env.GRADE_POINTS);

    core.info(`Deducted grade by -${process.env.LATE_POINTS} due to late penalty.`);

    if (process.env.COMPILE_STATUS !== 'success') {
      grade_points -= 5;
      core.info('Deducted grade by -5 points due to compile warnings.');
    }

    if (process.env.JAVADOC_STATUS !== 'success') {
      grade_points -= 5;
      core.info('Deducted grade by -5 points due to Javadoc warnings.');
    }

    if (process.env.COMMITS_STATUS !== 'success') {
      grade_points -= 5;
      core.info('Deducted grade by -5 points due to too few commits.');
    }

    if (grade_points < 0) {
      grade_points = 0;
      core.info(`Points reset to 0 (was ${grade_points}).`);
    }

    const final_points = grade_points;
    core.setOutput('final_points', final_points);

    core.info(final_points);

    // trick github classroom into using this new value
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to calculate final grade after deductions.');
  }
};