if(!window.jQuery) {
    throw 'Sorry, quizJS cannot run without jQuery!'
}
    
(function($, global) {
    var jsQuiz = function(quizSelector) {
        var self = this;
        var $this = self.$this = $(quizSelector);
        self.panes = [];
        $this.find('.quiz-pane').each(function() {
            self.panes.push(new quizPane(this, self));
        });
        if (!self.panes.length) {
            throw 'No questions found!';
        }
        self.panes[0].setActive();
        self.panes[self.panes.length - 1].isLast = true;
        
        
        //Remove any dangling class attributes that don't define a class.
        $('*[class=""]').removeAttr('class');
        
        $this.width(self.panes[0].$this.width());
    }

    jsQuiz.prototype.howManyCorrect = function() {
        var theresults = 0;
        this.panes.forEach(x => theresults += x.result);
        return theresults;
    }
    
    jsQuiz.prototype.getActivePaneIndex = function() {
        for (var i = 0; i < this.panes.length; i++) {
            if (this.panes[i].isActive())
                return i;
        }
        return -1;
    }
        
    //Increments to next question if it exists
    //Otherwise, increments to quiz results pane and calls closeOut.
    jsQuiz.prototype.nextQuestion = function() {
        var currentPaneIndex = this.getActivePaneIndex();
        this.panes[currentPaneIndex].setInactive();
        
        currentPaneIndex++;
        if (this.panes[currentPaneIndex]) {
            this.panes[currentPaneIndex].setActive();
        } else {
            this.closeOut();
                
        }
        var width = this.panes[0].getWidth();
        this.$this.find('.quiz-wrapper').css({'transform':'translateX(' + (-1 * width  * currentPaneIndex) +'px)'});
    }
    
    jsQuiz.prototype.closeOut = function() {
        console.log('You got ' + this.howManyCorrect() + ' out of ' + this.panes.length + '.');
        var $this = this.$this;
        $this.find('.num-correct').text(this.howManyCorrect());
        $this.find('.num-total').text(this.panes.length);
    }
    
    jsQuiz.prototype.howManyTotal = function() {
        return this.panes.length;
    }
    var quizPane = function(elem, parent) {
        var self = this;
        var $this = self.$this = $(elem);
        self.parent = parent;
        self.submitted = false;
        self.result = 0;
        self.correct = $this.find('.correct-answer').text();
        self.answers = [];
        $this.find('li').each(function() {
            self.answers.push(new quizAnswer(this, self));
        });
        
        self.button = $this.find('button');
        self.button.click(self.checkAnswer(self));
        $this.on('click', 'li', this.selected(self));
        
    }
    
    // Creating closure so function can access current pane
    quizPane.prototype.selected = function(pane) {
        return function() {
            if (!pane.submitted && pane.isActive()) {
                var $this = $(this);
                $this.siblings().removeClass('selected');
                $(this).addClass('selected'); 
            }
        
        }
    }
    
    quizPane.prototype.getWidth = function() {
        return this.$this.width();
    }
    
    quizPane.prototype.checkAnswer = function(self) {
        return function() {
            if (!self.submitted) {
                var correct = self.correct;
                var $selected = self.$this.find('.selected');
                if (!$selected.length) {
                    console.log('Please select an answer!');
                    return;
                }
                if (correct === $selected.text()) {
                    console.log("yes, you are correct!");
                    self.result = 1;
                } else {
                    console.log("WRONG");
                }
                self.submitted = true;
                console.log(self);
                if (self.isLast)
                    self.button.text('Show Results');
                else
                    self.button.text('Next Question');
            } else {
                if (self.isActive()) {
                    self.parent.nextQuestion();
                }
            }
        }
    }
    
    quizPane.prototype.isActive = function() {
        return this.$this.hasClass('active');
    }
    
    quizPane.prototype.setActive = function() {
        this.$this.addClass('active');
    }
    
    quizPane.prototype.setInactive = function() {
        this.$this.removeClass('active');
    }
    
    var quizAnswer = function(elem, parent) {
        var self = this;
        self.pane = parent;
        self.$this = $(elem);
        if (self.correct = self.$this.hasClass('correct-answer')) {
            //Removing clues for right answer
            self.$this.removeClass('correct-answer');   
        }
    }
    
    jsQuiz.init = function(quizSelector) {
        new jsQuiz(quizSelector);
    }
 
    
    global.jsQuiz = jsQuiz.init;
    
})(jQuery, window);

myfirstQuiz = new jsQuiz('.myfirstquiz');
mysecondQuiz = new jsQuiz('.mysecondquiz');
//console.log(myfirstQuiz);
//console.log(myfirstQuiz);



