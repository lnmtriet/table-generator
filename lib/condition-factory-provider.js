'use babel';

// data source is an array of objects
const API_URL = 'https://cdn.rawgit.com/lnmtriet/table-generator/b4f26af8/data/condition-factory.json';

class ConditionFactoryProvider {
	constructor() {
		// offer suggestions only when editing plain text or HTML files
		this.selector = '*';
	}

	getSuggestions(options) {
		const { prefix } = options;

	  return this.findMatchingSuggestions(prefix);
	}

	findMatchingSuggestions(prefix) {
		return new Promise((resolve) => {
			// fire off an async request to the external API
			fetch(API_URL)
				.then((response) => {
					// convert raw response data to json
					return response.json();
				})
				.then((json) => {
					// filter json (list of suggestions) to those matching the prefix
					let matchingSuggestions = json.filter((suggestion) => {
						return suggestion.text.startsWith(prefix);
					});

					let inflatedSuggestions = matchingSuggestions.map(this.inflateSuggestion);

					// resolve the promise to show suggestions
					resolve(inflatedSuggestions);
				})
				.catch((err) => {
					// something went wrong
					console.log(err);
				});
		});
	}

	// clones a suggestion object to a new object with some shared additions
	// cloning also fixes an issue where selecting a suggestion won't insert it
	inflateSuggestion(suggestion) {
		return {
			text: suggestion.text,
			description: 'Predefined Condition\n'+ suggestion.description,
			type: 'value',
			rightLabel: suggestion.description
		};
	}
}
export default new ConditionFactoryProvider();
