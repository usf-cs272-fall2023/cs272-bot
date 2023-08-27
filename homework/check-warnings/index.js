module.exports = async ({core, exec}) => {
  try {
    let xlint = '';
    let xdoclint = '';

    if (`${process.env.COMPILE}`.toLowerCase() === 'true') {
      xlint = '-Dconfig.xlint=-Xlint:all,-path,-processing';
    }

    if (`${process.env.JAVADOC}`.toLowerCase() === 'true') {
      xdoclint = '-Dconfig.xdoclint=-Xdoclint:all/private';
    }

    // -D flags based on pom.xml properties
    const args = [
      '-f', 'pom.xml', '-ntp', 
      `"${xlint}"`,
      `"${xdoclint}"`, 
      `"-Dconfig.werror=true"`,
      `"-Dmaven.compiler.showWarnings=true"`,
      'clean', 'compile'
    ];

    try {
      await exec.exec('mvn', args);
    }
    catch (error) {
      process.exitCode = 1;
    }
  }
  catch(error) {
    core.info(`${error.name}: ${error.message}`);
    core.setFailed('Unable to check for compile warnings.');
  }
};