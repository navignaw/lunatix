var Terminal = function() {
	return {
		"settings": {
        	greetings: 'You awaken in a dark directory...',
        	name: 'lunatix',
        	height: 400,
        	prompt: '$> '
    	},

		"commands": {
			"echo": function(args) {
				this.echo(args);
			}
		}
	};
}();