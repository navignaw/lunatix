function Textbox(parent, x, y, style) {
    var self = this.div = $('<div class="textbox terminal">' +
                            '<div class="cmd"><span class="cursor blink">&nbsp;</span></div>' +
                            '</div>');

    // Update style
    var TEXT_HEIGHT = 84;
    style.width = '100%';
    self.children('.cmd').css(style);
    parent.prepend(self);

    Terminal.offset += TEXT_HEIGHT;
    $('#terminal').animate({
        'margin-top': '20px',
        'height': '-=' + (TEXT_HEIGHT + 12).toString()
    });
    self.animate({
        'max-height': TEXT_HEIGHT.toString() + 'px'
    });

    self.mousewheel(function(event, delta) {
        if (delta > 0) {
            self.animate({ scrollTop: parseInt(self.scrollTop(), 10) - 15 }, 10);
        } else {
            self.animate({ scrollTop: parseInt(self.scrollTop(), 10) + 15 }, 10);
        }
    });

    this.destroy = function() {
        self.animate({
            'height': 0
        }, 400, function() {
            self.remove();
        });
        $('#terminal').animate({
            'margin-top': '30px',
            'height': '+=' + (TEXT_HEIGHT + 12).toString()
        });
    };

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
        delay = delay || 30;
        animating = true;

        var c = 0;
        var $text = $('<span></span>');
        var textNode = document.createTextNode('');
        $text.append(textNode);
        self.find('.cursor').before($text);
        self.animate({ scrollTop: self.prop('scrollHeight') });

        /* Every delay ms, insert a new character into the command line.
         * When all characters are inserted, echo to terminal and replace prompt. */
        var readCharacter = function() {
            if (c === message.length) {
                $text.replaceWith(['<div>', textNode.data, '</div>'].join(''));
                animating = false;
                callback();
                return;
            }

            var character = message[c++];
            // Check for special character.
            if (character !== '`') {
                textNode.appendData(character);
            } else if (c !== message.length) {
                var nextCharacter = message[c++];
                if (nextCharacter === '`') {
                    textNode.appendData('`');
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
