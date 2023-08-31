// creates an issue for the code review grade
module.exports = async ({github, context, core}) => {
  try {
    // already know from workflow that was approved by authorized user
    // however not sure if the state is approved or not
    const state  = context.payload.review.state;

    if (state != 'approved') {
      core.warning(`A review grade request was not created due to an unexpected review state (${state}). Please manually create a review grade issue instead.`);
      return;
    }

    // make sure does not have an error label
    const labels = new Set(context.payload.pull_request.labels.map(label => label.name));

    if (labels.has('error')) {
      core.warning(`A review grade request was not created due to an unexpected "error" label. Please manually create a review grade issue instead.`);
      return;
    }
    
    // make sure has one of the 3 status labels
    if (!labels.has('resubmit-code-review') && !labels.has('resubmit-quick-review') && !labels.has('review-passed')) {
      core.warning(`A review grade request was not created due to a missing status label. Please manually create a review grade issue instead.`);
      return;
    }

    core.info(JSON.stringify(context.payload.pull_request.base));
    core.info(JSON.stringify(context.payload.pull_request.head));

    // verify review was approved
    // get release label
    // get resubmit status
    // if release that needs grade, create review issue
    // parse information needed for issue

  }
  catch (error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed(`Unable to create review grade issue from #${context?.payload?.pull_request?.number}.`);
  }
};