module.exports = async ({github, context, core}) => {
  const releases = process.env.RELEASES;

  let summary = core.summary;
  summary = summary.addRaw('# CS 272 Project Statistics', true);
  summary = summary.addRaw('', true);
  summary = summary.addRaw(`:octocat: Hello @${ context.actor }! You can find your project statistics below.`, true);
  summary = summary.addRaw('', true);

  let projects = {
    project1: 'Project 1 Index',
    project2: 'Project 2 Search',
    project3: 'Project 3 Threads',
    project4: 'Project 4 Crawl',
    project5: 'Project 5 Server'
  };

  for (const project in projects) {
    if (releases.hasOwnProperty(project)) {
      summary = summary.addRaw(`## ${projects[project]}`, true);


      summary = summary.addRaw('', true);
    }
  }

  await summary.write();
};