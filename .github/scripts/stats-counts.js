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
  
  async function checkoutRef(ref) {
    core.startGroup(`Cloning ${ref}...`);

    const command = 'git';
    const args = ['clone', '--depth', '1', '--no-tags', '-c', 'advice.detachedHead=false', '--branch', ref, `https://github-actions:${token}@github.com/${context.repo.owner}/${context.repo.repo}`, ref];
    await exec.exec(command, args);

    await exec.exec('ls', ['-ACGR', `${path}/src/main/java`]);
    core.endGroup();
  }

  async function compareRefs(summary, older, newer) {
    core.info('');
    core.info(`Comparing releases ${older} and ${newer}`);

    await checkoutRef(older);
    await checkoutRef(newer);

    const command = 'cloc';
    const args = ['--include-ext=java', '--ignore-whitespace', '--ignore-case', '--quiet', '--md', '--hide-rate', '--count-and-diff', older, newer]

    // https://github.com/actions/toolkit/tree/main/packages/exec#outputoptions
    let out = [];
    let err = [];

    const options = {};
    options.listeners = {
      stdout: (data) => {
        const line = data.toString();
        // out.push(data.toString());
        summary = summary.addRaw(line);
        core.info(line);
      },
      stderr: (data) => {
        err.push(data.toString());
      }
    };

    core.startGroup(`Running cloc...`);
    await exec.exec(command, args);
    // out.forEach(line => core.info(line));
    // err.forEach(line => core.error(line));
    core.endGroup();

    await summary.addRaw('hello').write();
  }

  for (const project in projects) {
    summary = summary.addEOL();
    summary = summary.addRaw(`## ${projects[project]}`, true);
    summary = summary.addEOL();

    const current = releases[project];
    const reviews = current['request-code-review'].concat(current['request-quick-review']);
    reviews.sort();

    summary = summary.addRaw(`You had \`${reviews.length}\` code reviews for this project. `, false);

    let older = current['grade-tests'].find(x => x.match(/^v([1-5])\.1\.(\d+)$/));
    let newer = undefined;

    if (current['grade-design'].length > 0) {
      newer = current['grade-design'][0];
      summary = summary.addRaw(`The following are the **source-lines-of-code** metrics for the [${older}](${release_link}${older}) test release compared to the [${newer}](${release_link}${newer}) design release.`);
    }
    else {
      newer = reviews[reviews.length - 1];
      summary = summary.addRaw(`The following are the **source-lines-of-code** metrics for the [${older}](${release_link}${older}) test release compared to the last reviewed [${newer}](${release_link}${newer}) release.`);
    }

    summary = summary.addEOL();
    summary = summary.addEOL();

    const out = await compareRefs(older, newer);
    core.info('out: ' + out);
  }

  // make sure last summary buffer is written
  await summary.write();
};