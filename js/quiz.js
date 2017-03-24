(function($, global) {
    

    
    jsQuiz = function(quizSelector) {
        var self = this;
        self.jself = $(quizSelector);
        self.panes = [];
        self.jself.find('.quiz-pane').each(function() {
            self.panes.push(new quizPane(this, self));
        });
        
        self.panes[0].setActive();
        //Remove any dangling class attributes that don't define a class.
        $('*[class=""]').removeAttr('class');
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
    }
    
    //Increments to next question if it exists
    //Returns true if there is a next question, false otherwise;
    jsQuiz.prototype.nextQuestion = function() {
        var currentPaneIndex = this.getActivePaneIndex();
        this.panes[currentPaneIndex].jself.removeClass('active');
        //this.panes[currentPaneIndex].jself.slideUp();
        currentPaneIndex++;
        if (this.panes[currentPaneIndex]) {
            this.panes[currentPaneIndex].setActive();
            var width = this.panes[0].getWidth();
            this.jself.find('.quiz-wrapper').css({'transform':'translateX(' + (-1 * width  * currentPaneIndex) +'px)'});
            
        } else {
            this.closeOut();
                return false;
        }
        
        
    }
    
    jsQuiz.prototype.closeOut = function() {
        
        console.log('You got ' + this.howManyCorrect() + ' out of ' + this.panes.length + '.');
    }
    
    jsQuiz.prototype.howManyTotal = function() {
        return this.panes.length;
    }
    quizPane = function(elem, parent) {
        var self = this;
        self.parent = parent;
        self.submitted = false;
        self.result = 0;
        self.jself = $(elem);
        self.correct = this.jself.find('.correct-answer').text();
        self.answers = [];
        self.jself.find('li').each(function() {
            self.answers.push(new quizAnswer(this, self));
        });
        
        self.button = this.jself.find('button');
        self.button.click(self.checkAnswer(self));
        
    }
    
    quizPane.prototype.getWidth = function() {
        return this.jself.width();
    }
    
    quizPane.prototype.checkAnswer = function(self) {
        return function() {
            if (!self.submitted) {
                var correct = self.correct;
                var selected = self.jself.find('.selected').text();
                if (correct === selected) {
                    console.log("yes, you are correct!");
                    self.result = 1;
                } else {
                    console.log("WRONG");
                }
                self.submitted = true;
            } else {
                if (self.isActive()) {
                    self.parent.nextQuestion();
                }
            }
        }
    }
    
    quizPane.prototype.isActive = function() {
        return this.jself.hasClass('active');
    }
    
    quizPane.prototype.setActive = function() {
        this.jself.addClass('active');
    }
    quizAnswer = function(elem, parent) {
        var self = this;
        self.pane = parent;
        self.jself = $(elem);
        if (self.correct = self.jself.hasClass('correct-answer')) {
            //Removing clues for right answer
            self.jself.removeClass('correct-answer');   
        }       
        self.jself.click(self.selected(self));
    }
    
    quizAnswer.prototype.selected = function(closureSelf) {
            var jself = closureSelf.jself;
            return function() {
                if (!closureSelf.pane.submitted && closureSelf.pane.isActive()) {
                    jself.siblings().removeClass('selected');
                    jself.addClass('selected');
                }
            }
                
    }
        
    
    
 
    
    global.jsQuiz = jsQuiz;
    
})(jQuery, window);

myfirstQuiz = new jsQuiz('.myfirstquiz');
mysecondQuiz = new jsQuiz('.mysecondquiz');
console.log(myfirstQuiz);
//console.log(myfirstQuiz);

$('.quiz-pane').width($('.myfirstquiz').width());

