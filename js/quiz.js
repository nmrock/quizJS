(function($, global) {
    

    
    jsQuiz = function(quizSelector) {
        var self = this;
        self.jself = $(quizSelector);
        self.panes = [];
        self.jself.find('.quiz-pane').each(function() {
            self.panes.push(new quizPane(this));
        });
            
        $('*[class=""]').removeAttr('class');
    }

    jsQuiz.prototype.howManyCorrect = function() {
        var self = this;
        var theresults = 0;
        self.panes.forEach(x => theresults += x.result);
        console.log(theresults);
        //return theresults;
    }
    quizPane = function(elem) {
        var self = this;
        self.result = 0;
        self.jself = $(elem);
        self.correct = this.jself.find('.correct-answer').text();
        self.answers = [];
        self.jself.find('li').each(function() {
            self.answers.push(new quizAnswer(this));
        });
        
        self.button = this.jself.find('button');
        self.button.click(self.checkAnswer(self));
        
    }
    
    quizPane.prototype.checkAnswer = function(self) {
        return function() {
            var correct = self.correct;
            var selected = self.jself.find('.selected').text();
            if (correct === selected) {
                console.log("yes, you are correct!");
                self.result = 1;
            } else {
                console.log("WRONG");
            }
        }
        
    }
    
    quizAnswer = function(elem) {
        var self = this;
        self.jself = $(elem);
        if (self.correct = self.jself.hasClass('correct-answer')) {
            self.jself.removeClass('correct-answer');   
           
        }       
        self.jself.click(self.selected(self.jself));
    }
    
    quizAnswer.prototype.selected = function(closureSelf) {
            
            return function() {
                closureSelf.siblings().removeClass('selected');
                closureSelf.addClass('selected');
                
            }
        
    }
    
 
    
    global.jsQuiz = jsQuiz;
    
})(jQuery, window);

myfirstQuiz = new jsQuiz('.myfirstquiz');
mysecondQuiz = new jsQuiz('.mysecondquiz');
console.log(myfirstQuiz);
//console.log(myfirstQuiz);

