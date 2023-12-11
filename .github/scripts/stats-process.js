module.exports = async ({github, context, core}) => {
  const releases = JSON.parse(process.env.RELEASES);
  const projects = ['project1', 'project2', 'project3', 'project4', 'project5'];

  let review_count = 0;
  let projects_passed = 0;
  let summary = core.summary;

  summary = summary.addRaw('# CS 272 Project Statistics', true);
  summary = summary.addRaw('', true);
  summary = summary.addRaw(`:octocat: You can find your project statistics below.`, true);
  summary = summary.addRaw('', true);

  // create code review summary table
  summary = summary.addRaw('|         Project: |  :one:  |  :two:  |  :three:  |  :four:  |  :five:  |', true);
  summary = summary.addRaw('|-----------------:|:---:|:---:|:---:|:---:|:---:|', true);

  summary = summary.addRaw('|   Project Tests: |', false);

  projects.forEach(project => {
    const current = releases[project]['grade-tests'];
    summary = summary.addRaw(`  ${current.length}  |`, false);
  });

  summary = summary.addRaw('', true);
  summary = summary.addRaw('| Project Reviews: |', false);

  projects.forEach(project => {
    const current = releases[project];
    const reviews = current['request-code-review'].concat(current['request-quick-review']);
    review_count += reviews.length;
    summary = summary.addRaw(`  ${reviews.length}  |`, false);
  });

  summary = summary.addRaw('', true);
  summary = summary.addRaw('|   Review Passed: |', false);

  projects.forEach(project => {
    const current = releases[project]['review-passed'];
    const emoji = current.length > 0 ? ':white_check_mark:' : '';
    
    projects_passed += current.length;
    summary = summary.addRaw(`  ${emoji}  |`, false);
  });

  summary = summary.addRaw('', true);
  summary = summary.addRaw('', true);

  // output total number of reviews
  summary = summary.addRaw(`You had a total of \`${review_count}\` code reviews this semester.`, true);

  await summary.write();
};