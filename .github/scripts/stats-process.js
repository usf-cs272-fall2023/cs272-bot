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

  summary = summary.addRaw('|         Project: |  :one:  |  :two:  |  :three:  |  :four:  |  :five:  |', true);
  summary = summary.addRaw('|-----------------:|:---:|:---:|:---:|:---:|:---:|', true);

  summary = summary.addRaw('|   Project Tests: |', false);

  projects.forEach(project => {
    const current = releases[project]['grade-tests'];
    summary = summary.addRaw(`  ${current.length}  |`, false);
  });

  summary = summary.addRaw('', true);
  summary = summary.addRaw('|   Project Reviews: |', false);

  projects.forEach(project => {
    const current = releases[project];
    const reviews = current['request-code-review'].concat(current['request-quick-review']);
    review_count += reviews.length;
    summary = summary.addRaw(`  ${reviews.length}  |`, false);
  });

  summary = summary.addRaw('', true);


// `
// |          Project |  1  |  2  |  3  |  4  |  5  |
// |-----------------:|:---:|:---:|:---:|:---:|:---:|
// |   Project Tests: |
// | Project Reviews: |
// |   Review Passed: |
// `;

  // for (const project in projects) {
  //   if (releases.hasOwnProperty(project)) {
  //     const current = releases[project];
  //     const tests = current['grade-tests'];
  //     const reviews = current['request-code-review'].concat(current['request-quick-review']);
  //     const passed = current['review-passed'];

  //     review_count += reviews.length;

  //     summary = summary.addRaw(`## ${projects[project]}`, true);
  //     summary = summary.addRaw('', true);

  //     summary = summary.addRaw(`| **Label** | **#** | **Releases** |`, true);
  //     summary = summary.addRaw(`|----------:|:-----:|:-----------------|`, true);
  //     summary = summary.addRaw(`|   Project Tests: | ${tests.length}   | ${listReleases(tests)}   |`, true);
  //     summary = summary.addRaw(`| Project Reviews: | ${reviews.length} | ${listReleases(reviews)} |`, true);
  //     summary = summary.addRaw(`|   Review Passed: | ${passed.length}  | ${listReleases(passed)}  |`, true);

  //     summary = summary.addRaw('', true);
  //   }
  // }

  summary = summary.addRaw(`## All Progress`, true);
  summary = summary.addRaw('', true);

  summary = summary.addRaw(`You had a total of \`${review_count}\` code reviews this semester.`);


  await summary.write();
};