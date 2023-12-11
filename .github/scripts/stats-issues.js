module.exports = async ({github, context, core}) => {
  const error_messages = [];
  const output = {};
  const releases = {};

  // label configuration
  const error_label = 'error';
  const release_regex = /^v([1-5])\.(\d+)\.(\d+)$/;

  const project_labels = new Set(['project1', 'project2', 'project3', 'project4', 'project5']);

  const grade_labels  = new Set(['grade-tests', 'grade-review', 'grade-design']);
  const review_labels = new Set(['request-code-review', 'request-quick-review']);
  const result_labels = new Set(['resubmit-code-review', 'resubmit-quick-review', 'review-passed']);

  const request_labels = new Set([...grade_labels, ...review_labels]);
  const valid_labels = new Set([...request_labels, ...result_labels]);

  // setup results
  project_labels.forEach(project => {
    releases[project] = {};
    valid_labels.forEach(label => {
      releases[project][label] = [];
    });
  });

  try {
    // get all repository issues
    const request = github.rest.issues.listForRepo.endpoint.merge({
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'all'
    });

    const response = await github.paginate(request);

    // process each issue
    issues: for (const issue of response) {
      const issue_labels = issue.labels.map(label => label.name);

      if (issue_labels.includes(error_label)) {
        core.info(`Skipping issue #${issue.number} due to "${error_label}" label.`);
        continue issues;
      }

      // TODO: Switch to an approach that iterates through array fewer times
      const issue_releases = issue_labels.filter(label => label.match(release_regex));
      const issue_projects = issue_labels.filter(label => project_labels.has(label));
      const issue_grades   = issue_labels.filter(label => grade_labels.has(label));
      const issue_reviews  = issue_labels.filter(label => review_labels.has(label));
      const issue_results  = issue_labels.filter(label => result_labels.has(label));

      // check for unexpected label combinations
      if (issue_projects.length != 1 || issue_releases.length != 1 ||
          issue_grades.length + issue_reviews.length != 1) {
        core.warning(`Skipping issue #${issue.number} due to unexpected labels: ${issue_labels}`);
        continue issues;
      }

      if (issue_reviews.length == 1 && issue_results.length != 1) {
        core.warning(`Skipping issue #${issue.number} due to missing review result label: ${issue_labels}`);
        continue issues;
      }

      // store release information
      core.info(`Processing issue #${issue.number} with labels: ${issue_labels}`);
      const issue_type = [issue_grades, issue_reviews].flat().shift();
      
      const issue_release = issue_releases.shift();
      releases[issue_projects.shift()][issue_type].push(issue_release);

      if (issue_results.length > 0) {
        const issue_result = issue_results.shift();
        releases[issue_projects.shift()][issue_result].push(issue_release);
      }
    }

    output.releases = JSON.stringify(releases);
    return releases;
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
      core.info(`${property}: ${output[property]}`);
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