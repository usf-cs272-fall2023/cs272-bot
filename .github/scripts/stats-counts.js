module.exports = async ({github, context, core, exec}) => {
  const releases = JSON.parse(process.env.RELEASES);
  const projects = ['project1', 'project2', 'project3'];

  const token = process.env.TOKEN;
  const release_link = `https://github.com/${context.repo.owner}/${context.repo.repo}/releases/tag/`;

  let summary = core.summary;
  
  async function checkoutRef(ref, path) {
    core.startGroup(`Cloning ${ref}...`);

    const command = 'git';
    const args = ['clone', '--depth', '1', '--no-tags', '-c', 'advice.detachedHead=false', '--branch', ref, `https://github-actions:${token}@github.com/${context.repo.owner}/${context.repo.repo}`, path];
    await exec.exec(command, args);

    await exec.exec('ls', ['-ACGR', `${path}/src/main/java`]);
    core.endGroup();
  }

  async function compareRefs(prefix, older, newer) {
    core.info('');
    core.info(`Comparing releases ${one} and ${two}`);

    await checkoutRef(older, prefix + 'older');
    await checkoutRef(newer, prefix + 'newer');

    const command = 'cloc';
    const args = ['--include-ext=java', '--ignore-whitespace', '--ignore-case', '--quiet', '--md', '--count-and-diff', prefix + 'older', prefix + 'newer']

    // https://github.com/actions/toolkit/tree/main/packages/exec#outputoptions
    let out = '';
    let err = '';

    const options = {};
    options.listeners = {
      stdout: (data) => {
        out += data.toString();
      },
      stderr: (data) => {
        err += data.toString();
      }
    };

    await exec.exec(command, args);

    core.info(out);
  }

  const one = releases['project1']['grade-tests'][0];
  const two = releases['project1']['grade-design'][0];

  await compareRefs('project1', one, two);

};