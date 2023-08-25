module.exports = async ({core, exec}) => {
  try {
    const compile = `${process.env.COMPILE}`.toLowerCase() === 'true';
    const javadoc = `${process.env.JAVADOC}`.toLowerCase() === 'true';

    const xlint = compile ? 'all,-path,-processing' : 'none';
    const xdoclint = javadoc ? 'all/private' : 'none';

    const args = [
      '-f', 'pom.xml', '-ntp', 
      `"-Dconfig.xlint=-Xlint:${xlint}"`,
      `"-Dconfig.xdoclint=-Xdoclint:${xdoclint}"`, 
      `"-Dconfig.werror=true"`,
      `"-Dmaven.compiler.showWarnings=true"`,
      'clean', 'compile'
    ];

    const result = await exec.exec('mvn', args);
    console.log(result);

    // if (num_commits < min_commits) {
    //   core.error(`Found only ${num_commits} commit(s)... at least ${min_commits} commits are required.`, {'title': '-5 Points'});
    //   process.exitCode = 1;
    // }
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check for compile warnings.');
  }
};