module.exports = async ({github, context, core}) => {
  const {RELEASES} = process.env;
  let markdown = [];
  markdown.push('# CS 272 Project Statistics');
  markdown.push('');
  markdown.push(`:octocat: Hello @${ context.actor }! You can find your project statistics below.`);
  markdown.push('');

  if (RELEASES.hasOwnProperty('project1')) {

  }

  await core.summary.addRaw(markdown.join('\n')).write();
};