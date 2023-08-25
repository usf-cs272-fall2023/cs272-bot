module.exports = async ({core, exec}) => {
  try {
    let xlint = 'none';
    let xdoclint = 'none';
    let types = [];

    if (`${process.env.COMPILE}`.toLowerCase() === 'true') {
      xlint = 'all,-path,-processing';
      xlint = 'all';
      types.push('compiler');
    }

    if (`${process.env.JAVADOC}`.toLowerCase() === 'true') {
      xdoclint = 'all/private';
      types.push('javadoc');
    }

    // -D flags based on pom.xml properties
    const args = [
      '-f', 'pom.xml', '-ntp', 
      `"-Dconfig.xlint=-Xlint:${xlint}"`,
      `"-Dconfig.xdoclint=-Xdoclint:${xdoclint}"`, 
      `"-Dconfig.werror=true"`,
      `"-Dmaven.compiler.showWarnings=true"`,
      'clean', 'compile'
    ];

    try {
      await exec.exec('mvn', args);
    }
    catch (error) {
      core.error(`Found 1 or more ${types.join(' and ')} warning(s).`, {'title': '-5 Points'});
      process.exitCode = 1;
    }
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check for compile warnings.');
  }
};