module.exports = async ({github, context, core, exec}) => {
  const releases = JSON.parse(process.env.RELEASES);
  const projects = ['project1', 'project2', 'project3'];

  const token = process.env.TOKEN;
  const release_link = `https://github.com/${context.repo.owner}/${context.repo.repo}/releases/tag/`;

  let summary = core.summary;
  
  async function checkoutRef(ref, path) {
    core.info('');
    core.startGroup(`Cloning ${ref}...`);

    const command = 'git';
    const args = ['clone', '--depth', '1', '--no-tags', '-c', 'advice.detachedHead=false', '--branch', ref, `https://github-actions:${token}@github.com/${context.repo.owner}/${context.repo.repo}`, path];
    await exec.exec(command, args);

    await exec.exec('ls', ['-ACGR', `${path}/src/main/java`]);
    core.endGroup();
  }

  const one = releases['project1']['grade-tests'][0];
  const two = releases['project1']['grade-design'][0];

  checkoutRef(one, 'one');
  checkoutRef(two, 'two');

  
};