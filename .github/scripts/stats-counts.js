module.exports = async ({github, context, core, exec}) => {
  const releases = JSON.parse(process.env.RELEASES);
  const token = process.env.TOKEN;
  const release_link = `https://github.com/${context.repo.owner}/${context.repo.repo}/releases/tag/`;

  const projects = {
    project1: 'Project 1 Index',
    project2: 'Project 2 Search',
    project3: 'Project 3 Threads'
  };

  let summary = core.summary;

  // TODO Checkout all tags asynchronously and await once
  
  // clones the tag or branch
  async function checkoutRef(ref) {
    core.startGroup(`Cloning ${ref}...`);

    const command = 'git';
    const args = ['clone', '--depth', '1', '--no-tags', '-c', 'advice.detachedHead=false', '--branch', ref, `https://github-actions:${token}@github.com/${context.repo.owner}/${context.repo.repo}`, ref];
    await exec.exec(command, args);

    await exec.exec('ls', ['-ACGR', `${ref}/src/main/java`]);
    core.endGroup();
  }

  // compares two tags or branches using cloc
  async function compareRefs(summary, older, newer) {
    const command = 'cloc';
    const args = ['--include-ext=java', '--ignore-whitespace', '--ignore-case', '--quiet', '--md', '--hide-rate', '--count-and-diff', older, newer]

    const options = {};
    options.listeners = {
      stdout: (data) => {
        core.info(data.toString());
        summary = summary.addRaw(data.toString(), true);
      },
      stderr: (data) => {
        core.error(data.toString());
      }
    };

    core.startGroup(`Running cloc...`);
    await exec.exec(command, args, options);
    core.endGroup();

    await summary.write();
  }

  for (const project in projects) {
    const current = releases[project];

    // skip cloc metrics if do not have a design grade
    if (current['grade-design'].length != 1) {
      continue;
    }

    const older = current['grade-tests'].find(x => x.match(/^v([1-5])\.1\.(\d+)$/));
    const newer = current['grade-design'][0];
    const reviews = current['request-code-review'].concat(current['request-quick-review']);

    // output headers for this project
    summary = summary.addEOL();
    summary = summary.addRaw(`## ${projects[project]}`, true);
    summary = summary.addEOL();

    summary = summary.addRaw(`You had \`${reviews.length}\` code reviews for this project. `, false);
    summary = summary.addRaw(`The following are the **source-lines-of-code** metrics for the [${older}](${release_link}${older}) test release compared to the [${newer}](${release_link}${newer}) design release.`, true);
    summary = summary.addEOL();
    await summary.write();

    // output comparison for this project
    core.info('');
    core.info(`Comparing releases ${older} and ${newer}`);

    await checkoutRef(older);
    await checkoutRef(newer);
    await compareRefs(summary, older, newer);
  }

  // compare project 1 to current main branch
  const older = releases['project1']['grade-tests'].find(x => x.match(/^v([1-5])\.1\.(\d+)$/));
  const newer = 'main';

  summary = summary.addEOL();
  summary = summary.addRaw(`## Project 1 to Latest`, true);
  summary = summary.addEOL();

  summary = summary.addRaw(`The following are the **source-lines-of-code** metrics for the [${older}](${release_link}${older}) test release compared to the latest version of your code.`, true);
  summary = summary.addEOL();
  await summary.write();

  core.info('');
  core.info(`Comparing releases ${older} and ${newer}`);

  await checkoutRef(newer);
  await compareRefs(summary, older, newer);

  const today = new Date().toLocaleString('en-US', {timeZone: 'America/Los_Angeles'});
  summary = summary.addSeparator();
  summary = summary.addRaw(`Generated on ${today}.`, true);
  await summary.write();
};