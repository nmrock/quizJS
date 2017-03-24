(function($, global) {
    
    function selected() {
        $(this).addClass('selected');
    }
    
    jsQuiz = function(quizSelector) {
        self = this;
        self.jself = $(quizSelector);
        self.questions = [];
        $('.quiz-pane').each(function() {
            self.questions.push(new quizQuestion(this));
        });
        
        self.selected(this) {
            
        }
        
        $(quizSelector + ' ul li').click(selected);
    }
    
    quizQuestion = function(q) {
            this.jself = $(q);
        //console.log(q);
            this.correct = this.jself.find('.correct-answer').removeAttr('class').text();
        
    }
    
 
    
    global.jsQuiz = jsQuiz;
    
})(jQuery, window);

myfirstQuiz = new jsQuiz('.myfirstquiz');
console.log(myfirstQuiz);
//console.log(myfirstQuiz);

