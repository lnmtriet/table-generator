'use babel';

// data source is an array of objects
import suggestions from '../data/condition-factory';

class IntermediateProvider {
	constructor() {
		// offer suggestions only when editing plain text or HTML files
		this.selector = '*';
	}

	getSuggestions(options) {
		const { prefix } = options;

		// only look for suggestions after 3 characters have been typed
	  return this.findMatchingSuggestions(prefix);
	}

	findMatchingSuggestions(prefix) {
		// filter list of suggestions to those matching the prefix, case sensitive
		let matchingSuggestions = suggestions.filter((suggestion) => {
			return suggestion.text.startsWith(prefix);
		});

		// run each matching suggestion through inflateSuggestion() and return
		return matchingSuggestions.map(this.inflateSuggestion);
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
export default new IntermediateProvider();
