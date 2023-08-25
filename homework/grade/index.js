module.exports = async ({github, context, core}) => {
  try {
    const grades = process.env.GRADE_OUTPUT;

    console.log(JSON.stringify(grades));

    const grade_starting = grades.grade_starting;
    core.notice(`Earned ${grade_starting} from tests before any deductions`, {'title': `+${grade_starting} Points`});
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to calculate final grade after deductions.');
  }
};