exports.deadlines = {
  // homework
  'Template':         {'max': 100, 'due': '2023-08-22'},
  'FileStemmer':      {'max': 100, 'due': '2023-09-01'},
  'JsonWriter':       {'max': 100, 'due': '2023-09-08'},
  'ArgumentParser':   {'max': 100, 'due': '2023-09-15'},
  'FileIndex':        {'max': 100, 'due': '2023-09-22'},
  'FileSorter':       {'max': 100, 'due': '2023-09-29'},
  'FileFinder':       {'max': 100, 'due': '2023-10-06'},
  'LoggerSetup':      {'max': 100, 'due': '2023-10-16'},
  'MultiReaderLock':  {'max': 100, 'due': '2023-10-20'},
  'PrimeFinder':      {'max': 100, 'due': '2023-10-27'},
  'HtmlFetcher':      {'max': 100, 'due': '2023-11-03'},
  'HtmlCleaner':      {'max': 100, 'due': '2023-11-10'},
  'LinkFinder':       {'max': 100, 'due': '2023-11-17'},
	'HeaderServer':     {'max': 100, 'due': '2023-12-01'},

  // project 1
  'Project v1.0 Tests':  {'max': 100, 'due': '2023-09-08'},
  'Project v1.0 Review': {'max': 100, 'due': '2023-09-15'},
  'Project v1.1 Tests':  {'max': 100, 'due': '2023-09-15'},
  'Project v1.1 Review': {'max': 100, 'due': '2023-09-22'},
	'Project v1.2 Review': {'max': 100, 'due': '2023-09-29'},
  'Project v1.x Design': {'max': 100, 'due': '2023-10-06'},

  // project 2
  'Project v2.0 Tests':  {'max': 100, 'due': '2023-10-06'},
  'Project v2.0 Review': {'max': 100, 'due': '2023-10-13'},
  'Project v2.1 Tests':  {'max': 100, 'due': '2023-10-13'},
  'Project v2.1 Review': {'max': 100, 'due': '2023-10-20'},
	'Project v2.2 Review': {'max': 100, 'due': '2023-10-27'},
  'Project v2.x Design': {'max': 100, 'due': '2023-11-03'},

  // project 3
  'Project v3.0 Tests':  {'max': 100, 'due': '2023-11-03'},
  'Project v3.0 Review': {'max': 100, 'due': '2023-11-10'},
  'Project v3.1 Tests':  {'max': 100, 'due': '2023-11-10'},
  'Project v3.1 Review': {'max': 100, 'due': '2023-11-17'},
  'Project v3.2 Tests':  {'max': 100, 'due': '2023-11-22'},
  'Project v3.2 Review': {'max': 100, 'due': '2023-12-01'},
  'Project v3.x Design': {'max': 100, 'due': '2023-12-08'},

  // project 4
  'Project v4.0 Tests':  {'max': 100, 'due': '2023-12-01'},
  'Project v4.1 Tests':  {'max': 100, 'due': '2023-12-08'},

  // project 5
  'Project v5.0 Tests':  {'max': 100, 'due': '2023-12-14'},
  'Project v5.0 Design': {'max': 100, 'due': '2023-12-14'}
};

exports.penalty = {
  'percent':  0.02, // percent deduction
  'maximum':  0.26, // maximum deduction  (in percent)
  'interval': 24,   // deduction interval (in hours)
};