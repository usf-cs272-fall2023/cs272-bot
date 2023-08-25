module.exports = async ({github, context, core}) => {
  try {
      const grade_results = JSON.parse(process.env.GRADE_RESULTS);
      core.log(grade_results.grade_starting);
      core.log(grade_results);
    // const grade_starting = parseFloat(process.env.GRADE_STARTING);

    // // output points earned from tests before handle deductions
    // core.notice(`Earned ${grade_starting} from tests before any deductions`, {'title': `+${grade_starting} Points`});

    // let grade_points = parseFloat(process.env.GRADE_POINTS);

    // core.info(`Deducted grade by -${process.env.LATE_POINTS} due to late penalty.`);

    // if (process.env.COMPILE_STATUS !== 'success') {
    //   grade_points -= 5;
    //   core.info('Deducted grade by -5 points due to compile warnings.');
    // }

    // if (process.env.JAVADOC_STATUS !== 'success') {
    //   grade_points -= 5;
    //   core.info('Deducted grade by -5 points due to Javadoc warnings.');
    // }

    // if (process.env.COMMITS_STATUS !== 'success') {
    //   grade_points -= 5;
    //   core.info('Deducted grade by -5 points due to too few commits.');
    // }

    // if (grade_points < 0) {
    //   grade_points = 0;
    //   core.info(`Points reset to 0 (was ${grade_points}).`);
    // }

    // const final_points = grade_points;
    // const final_grade = `Points ${final_points}/${process.env.GRADE_POSSIBLE}`;
    // core.setOutput('final_points', final_points);

    // core.info(final_points);

    // // trick github classroom into using this new value
    // const workflow_run = await github.rest.actions.getWorkflowRun({
    //   owner: context.repo.owner,
    //   repo: context.repo.repo,
    //   run_id: context.runId
    // });

    // const suite_url = workflow_run.data.check_suite_url;
    // const suite_id = parseInt(suite_url.match(/[0-9]+$/)[0], 10);
    
    // const check_runs = await github.rest.checks.listForSuite({
    //   owner: context.repo.owner,
    //   repo: context.repo.repo,
    //   check_name: 'Autograding',
    //   check_suite_id: suite_id,
    // });
  
    // let text = process.env.POINTS;
    // text = 'Points 10/5';
    
    // await github.rest.checks.update({
    //   owner: context.repo.owner,
    //   repo: context.repo.repo,
    //   check_run_id: check_runs.data.check_runs[0].id,
    //   output: {
    //     title: 'Autograding',
    //     summary: text,
    //     text: text,
    //     annotations: [
    //       {
    //         path: '.github',
    //         start_line: 1,
    //         end_line: 1,
    //         annotation_level: 'notice',
    //         message: text,
    //         title: 'Autograding complete',
    //       },
    //     ],
    //   },
    // });


  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to calculate final grade after deductions.');
  }
};