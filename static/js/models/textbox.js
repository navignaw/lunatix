function Textbox(parent, x, y, style) {
    this.div = $('<div class="textbox terminal"></div>');

    // Update style
    var TEXT_HEIGHT = 84;
    this.div.css(style);
    parent.prepend(this.div);

    Terminal.offset += TEXT_HEIGHT;
    $('#terminal').animate({
        'margin-top': '20px',
        'height': '-=' + (TEXT_HEIGHT + 12).toString()
    });
    this.div.animate({
        'height': TEXT_HEIGHT.toString() + 'px'
    });

    /* Animate text */
    var animating = false;
    this.animating = function() {
        return animating;
    };

    var animateTextAsync = _.bind(function(message, callback, delay) {
        if (message.length === 0) {
            return;
        }
        prompt = prompt || '';
        callback = callback || _.noop;
        delay = delay || 40;
        animating = true;

        var c = 0;
        var $text = $('<div></div>');
        this.div.append($text);
        this.div.animate({ scrollTop: this.div.prop('scrollHeight') });

        /* Every delay ms, insert a new character into the command line.
         * When all characters are inserted, echo to terminal and replace prompt. */
        var readCharacter = function() {
            if (c === message.length) {
                animating = false;
                callback();
                return;
            }

            var character = message[c++];
            // Check for special character.
            if (character !== '`') {
                $text.append(document.createTextNode(character));
            } else if (c !== message.length) {
                var nextCharacter = message[c++];
                if (nextCharacter === '`') {
                    $text.append(document.createTextNode('`'));
                } else {
                    // Extract number of milliseconds to pause.
                    var digits = message.substring(c-1).match(/^\d*/);
                    var waitCount = 0;
                    if (digits) {
                        waitCount = parseInt(digits[0], 10);
                        c += digits[0].length;
                    }
                    _.delay(readCharacter, waitCount + delay);
                    return;
                }
            }
            _.delay(readCharacter, delay);
        };
        _.delay(readCharacter, delay);
    }, this);

    /* Promises! Allow chaining of multiple asynchronous requests via then and fail */
    this.animateText = function(message, delay) {
        var deferred = $.Deferred();
        animateTextAsync(message, deferred.resolve, delay);
        return deferred.promise();
    };

    // TODO: x and y positioning
}
