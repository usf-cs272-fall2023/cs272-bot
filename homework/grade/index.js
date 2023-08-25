module.exports = async ({github, context, core}) => {
  try {
    const grade_results = JSON.parse(process.env.GRADE_RESULTS);

    const grade_starting = parseFloat(grade_results.grade_starting);
    const grade_possible = parseFloat(grade_results.grade_possible);
    const late_points = parseFloat(grade_results.late_points);
    const late_multiplier = parseFloat(grade_results.late_multiplier);
    const submitted_text = grade_results.submitted_text;
    const deadline_text = grade_results.deadline_text;

    // output results of late penalties
    if (late_points > 0) {
      core.warning(`Submitted ${late_multiplier} day(s) late (submitted: ${submitted_text}, deadline: ${deadline_text}).`, {'title': `-${late_points} Points`});
    }

    // output points earned from tests before handle deductions
    core.notice(`Earned ${grade_starting} points from tests before any deductions.`, {'title': `+${grade_starting} Points`});

    // calculate final grade
    let deductions = late_points;
    deductions += process.env.COMPILE_STATUS !== 'success' ? 5 : 0;
    deductions += process.env.JAVADOC_STATUS !== 'success' ? 5 : 0;
    deductions += process.env.COMMITS_STATUS !== 'success' ? 5 : 0;

    core.setOutput('deductions', deductions);
    core.info(`Total deductions: ${deductions}`);

    let final_points = deductions > grade_starting ? 0 : grade_starting - deductions;
    core.setOutput('final_points', final_points);
    core.info(`Final points: ${final_points}`);

    const final_grade = `Points ${final_points}/${grade_possible}`;

    // trick github classroom into using this new value
    const workflow_run = await github.rest.actions.getWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId
    });

    const suite_url = workflow_run.data.check_suite_url;
    const suite_id = parseInt(suite_url.match(/[0-9]+$/)[0], 10);
    
    const check_runs = await github.rest.checks.listForSuite({
      owner: context.repo.owner,
      repo: context.repo.repo,
      check_name: 'Autograding',
      check_suite_id: suite_id,
    });
  
    await github.rest.checks.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      check_run_id: check_runs.data.check_runs[0].id,
      output: {
        title: 'Autograding',
        summary: 'Points 1/2',
        text: 'Points 2/3',
        annotations: [
          {
            path: '.github',
            start_line: 1,
            end_line: 1,
            annotation_level: 'notice',
            message: 'Points 3/4',
            title: 'Autograding complete',
          },
        ],
      },
    });
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to calculate final grade after deductions.');
  }
};