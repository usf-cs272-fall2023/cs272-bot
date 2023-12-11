module.exports = async ({github, context, core, exec}) => {
  const releases = JSON.parse(process.env.RELEASES);
  const projects = ['project1', 'project2', 'project3'];

  const token = process.env.TOKEN;
  const release_link = `https://github.com/${context.repo.owner}/${context.repo.repo}/releases/tag/`;

  let summary = core.summary;
  
  async function checkoutRef(ref, path) {
    const command = 'git';
    const args = ['clone', '--depth', '1', '--no-tags', '--branch', ref, `https://github-actions:${token}@github.com/${context.repo.owner}/${context.repo.repo}`, path];
    await exec.exec(command, args);
  }

  const release = releases['project1']['grade-tests'][0];
  checkoutRef(release, 'one');
};