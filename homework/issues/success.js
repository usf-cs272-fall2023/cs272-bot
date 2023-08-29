module.exports = async ({github, context, core}) => {
  try {
    core.log('hello world');
    const student = JSON.parse(process.env.STUDENT_JSON);
    const results = JSON.parse(process.env.RESULTS_JSON);

    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body: `
  :octocat: @${context.actor} your grade request has been processed! See the details below:

  |  |  |
  |----:|:-----|
  |   Student: | ${student.name} |
  | USF Email: | \`${student.email}\` |
  | | |
  | Assignment: | ${results.assignment_name} |
  |   Deadline: | ${results.deadline_text} |
  |  Submitted: | ${results.submitted_text} |
  |   Workflow: | [Run ${results.workflow_run}](${context.payload.repository.html_url}/actions/runs/${results.workflow_run}) |
  | | |
  | Late Interval: | ${results.late_interval} hours (x${results.late_multiplier} multiplier) |
  | Late Penalty:  | -${results.late_points} points (-${results.late_percent}%) |
  | Late Grade:    | **${results.grade_points}** / ${results.grade_possible} points (${results.grade_percent}%) |

  You will receive a notice once your grade has been updated on Canvas.
      `
    });

    let assignees = ['ybsolomon', 'FrankGuglielmo', 'clarejw', 'MalekeHan'];

    await github.rest.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      state: 'open',
      labels: ['grade-homework'],
      assignees: assignees
    });
  }
  catch (error) {
    core.exportVariable('ERROR_MESSAGE', error.message);
    core.setFailed(process.env.ERROR_MESSAGE);
  }
};