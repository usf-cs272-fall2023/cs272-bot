module.exports = async ({github, context, core}) => {
	try {
		core.info(`Parsing issue body...`);
		const body = context.payload.issue.body;

		const pattern = /^### Full Name\s+([^\n]+)\s+### USF Email\s+([^\n]+)\b\s*$/;
		const matched = body.match(pattern);
		core.info(matched);

		if (matched !== null && matched.length === 3) {
			try {
				const parsed = {
					'name': matched[1],
					'email': matched[2],
				};

				if (parsed.hasOwnProperty('runid')) {
					core.exportVariable('GRADE_RUNID', `${parsed.runid}`);
				}

				if (parsed.hasOwnProperty('name') && parsed.hasOwnProperty('email')) {
					core.info(JSON.stringify(parsed));
					return JSON.stringify(parsed);
				}

				core.exportVariable('ERROR_MESSAGE', `Required "name" and "email" properties missing from issue body.`);
				core.setFailed(process.env.ERROR_MESSAGE);
			}
			catch (error) {
				core.exportVariable('ERROR_MESSAGE', `Unable to parse issue body. Error: ${error.message}`);
				core.setFailed(process.env.ERROR_MESSAGE);
			}
		}
		else {
			core.exportVariable('ERROR_MESSAGE', `Unable to find student details from issue body. Found: ${matched}`);
			core.setFailed(process.env.ERROR_MESSAGE);
		}
	}
	catch (error) {
		core.exportVariable('ERROR_MESSAGE', error.message);
		core.setFailed(process.env.ERROR_MESSAGE);
	}
};