// creates an issue for the code review grade
module.exports = async ({github, context, core}) => {
  const error_messages = [];

  try {
    // already know from workflow that was approved by authorized user
    // however not sure if the state is approved or not
    const state  = context.payload.review.state;

    if (state != 'approved') {
      error_messages.push(`Pull request has an unexpected review state (${state}).`);
    }

    // get version number from head ref
    const head_ref = context.payload.pull_request.head.ref;
    const pattern = /review\/(v(\d+)\.(\d+)\.(\d+))/g;
    const matches = head_ref.matchAll(pattern);

    if (matches == undefined) {
      error_messages.push(`Unable to determine release version from pull request (${head_ref}).`);
    }

    const groups = Array.from(matches)[0];
    const release = groups[1];
    const project = groups[2];
    const major = groups[3];
    const minor = groups[4];

    core.info(`Detected project ${project}, version ${major}, patch ${minor} (${release}).`);

    if (project > 3 || major > 2) {
      // do not create a grade issue (this is not an error)
      core.info(`Release ${release} does not need a code review grade.`);
    }
    else if (error_messages.length == 0) {
      // create issue if there were no errors so far
      const issue = {
        owner: context.repo.owner,
        repo: context.repo.repo
      };

      issue.title = 'Request Project Review Grade';
      issue.body = context.payload.pull_request.body;
      // issue.milestone = context.payload.pull_request.milestone.number;
      // issue.labels = ['grade-review', `project${project}`, release];
      // issue.assignees = ['ybsolomon', 'FrankGuglielmo', 'clarejw', 'MalekeHan'];
  
      const response = await github.rest.issues.create(issue);
      core.info(JSON.stringify(response));

      // TODO Add comment issue was created
    }
  }
  catch (error) {
    core.info(JSON.stringify(error));
    error_messages.push(`Unable to create review grade issue from #${context?.payload?.pull_request?.number}.`);
  }
  finally {
    // save and output all errors
    if (error_messages.length > 0) {
      core.startGroup(`Outputting errors...`);
      for (const message of error_messages) {
        core.error(message);
      }
      core.endGroup();

      core.setFailed(`Found ${error_messages.length} problems while creating a grade issue. Please manually create a grade issue if needed instead.`);
    }
  }
};