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
    core.info(`Comparing releases ${older} and ${newer}`);

    await checkoutRef(older, older);
    await checkoutRef(newer, newer);

    const command = 'cloc';
    const args = ['--include-ext=java', '--ignore-whitespace', '--ignore-case', '--quiet', '--md', '--hide-rate', '--count-and-diff', older, newer]

    // https://github.com/actions/toolkit/tree/main/packages/exec#outputoptions
    // let out = [];
    // let err = [];

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
    await exec.exec(command, args);
    core.endGroup();

    await summary.write();

    return out;
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

    const output = await compareRefs(project, older, newer);
    core.info("blah: " + output);

    summary = summary.addRaw("blah: " + output);
    summary = summary.addEOL();
    
    await summary.write();
  }
};