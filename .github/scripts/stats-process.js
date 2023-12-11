module.exports = async ({github, context, core}) => {
  const releases = JSON.parse(process.env.RELEASES);

  const projects = ['project1', 'project2', 'project3', 'project4', 'project5'];
  const release_link = `https://github.com/${context.repo.owner}/${context.repo.repo}/releases/tag/`;

  function listReleases(data) {
    return data.sort().map(release => `[\`${release}\`](${release_link}${release})`).join(', ');
  }

  let summary = core.summary;
  summary = summary.addRaw('# CS 272 Project Statistics', true);
  summary = summary.addRaw('', true);
  summary = summary.addRaw(`:octocat: Hello @${ context.actor }! You can find your project statistics below.`, true);
  summary = summary.addRaw('', true);

  let review_count = 0;

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

    summary = summary.addRaw(`  ${emoji}  |`, false);
  });

  summary = summary.addRaw('', true);
  summary = summary.addRaw('', true);

  summary = summary.addRaw(`You had a total of \`${review_count}\` code reviews this semester.`, true);
  await summary.write();

  // create project 1 source-lines-of-code table
  summary = summary.addRaw('## Project 1 SLOC');

  const v11 = releases['project1']['grade-tests'].find(version => version.startsWith('v1.1'));
  const v1x = releases['project1']['grade-design'][0];

  summary = summary.addRaw(`Comparing test release [\`${v11}\`](${release_link}${v11}) to design release [\`${v1x}\`](${release_link}${v1x})...`, true);

  await summary.write();
};