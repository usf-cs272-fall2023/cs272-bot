module.exports = async ({github, context, core}) => {
  const {RELEASES} = process.env;
  let markdown = [];
  markdown.push('# CS 272 Project Statistics');
  markdown.push('');
  markdown.push(`:octocat: Hello @${ context.actor }! You can find your project statistics below.`);
  markdown.push('');

  let projects = {
    project1: 'Project 1 Index',
    project2: 'Project 2 Search',
    project3: 'Project 3 Threads',
    project4: 'Project 4 Crawl',
    project5: 'Project 5 Server'
  };

  

  await core.summary.addRaw(markdown.join('\n')).write();
};