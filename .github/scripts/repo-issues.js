module.exports = async ({github, context, core}) => {
  const error_messages = [];
  const output = {};

  // label configuration
  const error_label = 'error';
  const release_regex = /^v([1-5])\.(\d+)\.(\d+)$/;

  const project_labels = new Set(['project1', 'project2', 'project3', 'project4', 'project5']);

  const grade_labels  = new Set(['grade-tests', 'grade-review', 'grade-design']);
  const review_labels = new Set(['request-code-review', 'request-quick-review']);
  const result_labels = new Set(['resubmit-code-review', 'resubmit-quick-review', 'review-passed']);

  const request_labels = new Set([...grade_labels, ...review_labels]);
  const valid_labels = new Set([...request_labels, ...result_labels]);

  // setup output
  project_labels.forEach(project => {
    output[project] = {};
    valid_labels.forEach(label => {
      output[project][label] = [];
    });
  });

  try {
    const request = github.rest.issues.listForRepo.endpoint.merge({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'all'
    });

    const response = await github.paginate(request);

    issues: for (const issue of response) {
      const label_names  = issue.labels.map(label => label.name);
      const issue_labels = new Set(label_names);

      if (issue_labels.has(error_label)) {
        core.info(`Skipping issue #${issue.number} due to "${error_label}" label.`);
        continue issues;
      }

      const issue_projects = Array.from(issue_labels.intersection(project_labels));
      const issue_releases = label_names.filter(label => label.match(release_regex));

      if (issue_projects.length != 1) {
        core.warning(`Skipping issue #${issue.number} due to unexpected labels: ${issue_projects}`);
        continue issues;
      }

      if (issue_releases.length != 1) {
        core.warning(`Skipping issue #${issue.number} due to unexpected labels: ${issue_releases}`);
        continue issues;
      }

      const issue_grades   = issue_labels.intersection(grade_labels);
      const issue_reviews  = issue_labels.intersection(review_labels);
      const issue_results  = issue_labels.intersection(result_labels);

      core.log(issue_projects);
      core.log(issue_releases);

      // let issue_projects = [];
      // let issue_grades   = [];
      // let issue_reviews  = [];
      // let issue_results  = [];
      // let issue_releases = [];

      // // loop through issue labels
      // labels: for (const label of issue.labels) {
      //   if (!label.hasOwnProperty('name')) {
      //     core.info(`Skipping issue #${issue.number} due to missing label name.`);
      //     continue issues;
      //   }
      //   else if (label.name == error_label) {
      //     core.info(`Skipping issue #${issue.number} due to "${error_label}" label.`);
      //     continue issues;
      //   }
      //   else if (project_labels.has(label.name)) {
      //     issue_projects.push(label.name);
      //   }
      //   else if (grade_labels.has(label.name)) {
      //     issue_grades.push(label.name);
      //   }
      //   else if (review_labels.has(label.name)) {
      //     issue_reviews.push(label.name);
      //   }
      //   else if (result_labels.has(label.name)) {
      //     issue_results.push(label.name);
      //   }
      //   else if (label.name.match(release_regex)) {
      //     issue_releases.push(label.name);
      //   }
      //   else {
      //     core.warning(`Issue #${issue.number} has an unexpected "${label.name}" label.`);
      //   }
      // }

      // // check for unexpected label combinations
      // if (issue_projects.length != 1) {
      //   core.warning(`Issue #${issue.number} has ${issue_projects.length} project labels: ${issue_projects}`);
      // }
      
      // if (issue_releases.length != 1) {
      //   core.warning(`Issue #${issue.number} has ${issue_releases.length} release labels: ${issue_releases}`);
      // }

      // if (issue_releases.length != 1) {
      //   core.warning(`Issue #${issue.number} has ${issue_releases.length} release labels: ${issue_releases}`);
      // }


      // core.info(JSON.stringify(issue_projects));
      // core.info(JSON.stringify(issue_labels));
      // core.info(JSON.stringify(issue_releases));
      // break; // TODO just test if loop works
    }

  }
  catch (error) {
    // add error and output stack trace
    error_messages.push(`Error: ${error.message}`);

    core.info('');
    core.startGroup(`Encountered ${error.name}...`);
    core.info(error.message);
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

      core.setFailed(`Found ${error_messages.length} problems.`);
    }
  }
};