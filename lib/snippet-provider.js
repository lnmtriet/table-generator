'use babel';

// notice data is not being loaded from a local json file
// instead we will fetch suggestions from this URL
const SNIPPET_URL = 'https://raw.githubusercontent.com/lnmtriet/table-generator/master/data/snippet.json';
const METHOD_URL = 'https://raw.githubusercontent.com/lnmtriet/table-generator/master/data/method.json';

class SnippetProvider {
	constructor() {
		// offer suggestions only when editing plain text or HTML files
		this.selector = '.text.plain, .text.html.basic';

		// except when editing a comment within an HTML file
		this.disableForSelector = '.text.html.basic .comment';

		// make these suggestions appear above default suggestions
		this.suggestionPriority = 2;
	}

	getSuggestions(options) {
		const { editor, bufferPosition } = options;

		let prefix = this.getPrefix(editor, bufferPosition);

		if (/\S*@/.test(prefix)) {
			prefix = prefix.substring(prefix.lastIndexOf('@'));
			var matched = this.rangeConditionMatching(prefix);
			if (!!matched){
				return matched;
			}
			return this.findMatchingSuggestions(prefix, SNIPPET_URL);
		}

		if (/\S+\./.test(prefix)) {
			return this.findMatchingSuggestions(prefix.substring(prefix.lastIndexOf('.')), METHOD_URL);
		}
	}

	getPrefix(editor, bufferPosition) {
		let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
		let match = line.match(/\S+$/);
		return match ? match[0] : '';
	}

	rangeConditionMatching(prefix){
		var rangeTypes = ["fico", "ltv", "cltv", "term", "la"];
		for (var i = 0 ; i < rangeTypes.length; i++){
			var patt = new RegExp("^@" + rangeTypes[i] + "[\\(|\\[][0-9]+");
			if (patt.test(prefix)) {
				return this.generateRangeCondition(prefix, rangeTypes[i]);
			}
		}
	}

	generateRangeCondition(prefix, type) {
		var openBracket = prefix.substr(type.length + 1, 1);
		var closeBracket = openBracket == '(' ? ']' : ')';
		var numberOfCols = new Number(prefix.substring(type.length + 2));
		if (numberOfCols <= 1){
			throw "number of columns/rows must be greater than 1";
		}
		var mySnippet = type + openBracket + "$1";
		var numberOfBoundaries = numberOfCols + 1;
		for (i = 2; i <= numberOfBoundaries; i++){
			mySnippet += ",$"+ i;
		}
		return [{
			displayText: type + openBracket + numberOfCols + closeBracket,
			snippet: mySnippet,
			description: "Define " + numberOfBoundaries + " boundaries for " + numberOfCols + " consecutive row/column ranges",
			descriptionMoreURL: "https://docs.google.com/document/d/1CU0siZgOwDHW4ql1p1C73SBRBkA8yz9pK5XiMNabhgc/edit",
			replacementPrefix: prefix,
			iconHTML: '<i class="icon-comment"></i>',
			type: 'snippet',
			rightLabelHTML: '<span class="aab-right-label">Multiple Ranges Condition</span>' // look in /styles/atom-slds.less
		}];
	}

	findMatchingSuggestions(prefix, url) {
		return new Promise((resolve) => {
			fetch(url)
				.then((response) => {
					return response.json();
				})
				.then((json) => {
					let matchingSuggestions = json.filter((suggestion) => {
						return suggestion.displayText.startsWith(prefix);
					});

					let inflateSuggestion = this.inflateSuggestion.bind(this, prefix);
					let inflatedSuggestions = matchingSuggestions.map(inflateSuggestion);

					resolve(inflatedSuggestions);
				})
				.catch((err) => {
					console.log(err);
				});
		});
	}

	inflateSuggestion(replacementPrefix, suggestion) {
		return {
			displayText: suggestion.displayText,
			snippet: suggestion.snippet,
			description: suggestion.description,
			descriptionMoreURL: "https://docs.google.com/document/d/1CU0siZgOwDHW4ql1p1C73SBRBkA8yz9pK5XiMNabhgc/edit",
			replacementPrefix: replacementPrefix, // ensures entire prefix is replaced
			iconHTML: '<i class="icon-comment"></i>',
			type: 'snippet',
			rightLabelHTML: '<span class="aab-right-label">' + suggestion.rightLabel + '</span>' // look in /styles/atom-slds.less
		};
	}
	onDidInsertSuggestion(options) {
		atom.notifications.addSuccess(options.suggestion.displayText + ' was inserted.');
	}
}
export default new SnippetProvider();
