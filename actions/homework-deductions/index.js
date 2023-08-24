module.exports = async ({github, context, core}) => {
	let deductions = 0;
	let messages = [];

	switch (process.env.COMPILE_STATUS) {
		case 'failure':
			deductions -= 5;
			messages.push('The Java code has compile warnings.');
		case 'success':
			break;
		default:
			core.setFailed('Unable to verify the compile warning status.');
	}

	switch (process.env.JAVADOC_STATUS) {
		case 'failure':
			deductions -= 5;
			messages.push('The Javadoc comments have compile warnings.');
		case 'success':
			break;
		default:
			core.setFailed('Unable to verify the Javadoc warning status.');
	}

	switch (process.env.COMMITS_STATUS) {
		case 'failure':
			deductions -= 5;
			messages.push('The code base does not have enough commits.');
		case 'success':
			break;
		default:
			core.setFailed('Unable to verify the commit count status.');
	}

	core.setOutput('other_deductions', deductions);

	if (deductions < 0) {
		core.warning(`Grade reduced by ${deductions} points in deductions: ${messages.join(' ')}`);
	}
};