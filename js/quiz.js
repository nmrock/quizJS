'use strict';
if(!window.jQuery) {
    throw 'Sorry, quizJS cannot run without jQuery!'
}
    
(function(global) {
    var jsQuiz = function(quizSelector, paneSelector, answerSelector) {
        var self = this;
        this.paneSelector = paneSelector || '.quiz-pane';
        this.answerSelector = answerSelector || 'li';
        this.activePane = null;
        this.counter = 0;
        var elem = global.document.querySelector(quizSelector);
        self.panes = [];
        var paneElems = elem.querySelectorAll(this.paneSelector);
        
        for (var i = 0; i < paneElems.length; i++) {
            self.panes.push(new quizPane(paneElems[i], answerSelector, self));
        }
    
        
        if (!self.panes.length) {
            throw 'No questions found!';
        }
        
        console.log(self);
        
       self.panes[self.panes.length - 1].isLast = true;
        console.log(self);
        
        //Remove any dangling class attributes that don't define a class.
        $('*[class=""]').removeAttr('class');
        
        elem.style.width = self.panes[0].elem.offsetWidth + 'px';
        
        elem.addEventListener('click', function(e) {self.clickHandler(e)});
        
        self.setActivePane();
    }
    
 
    
 
    jsQuiz.prototype.clickHandler = function(e) {
        
        var elem = e.target
        
        //If the user clicked an answer option in the active pane
        //And they have not already submitted an answer, select the clicked elem
        if (elem.matches('.active ' + this.answerSelector)
            && !elem.matches('.submitted' + this.answerSelector)) {
           
            var prevSelected = this.activePane.elem.querySelector('.selected')
            if (prevSelected) {
                prevSelected.classList.remove('selected');
            }
            
            elem.classList.add('selected');      
        }
        
        if (elem.matches('.active button'))
            {
                console.log('button click');
                this.nextQuestion();
            }
    }

     
    jsQuiz.prototype.setActivePane = function() {
        if (this.activePane) {
            this.activePane.elem.classList.remove('active');
        }
        this.activePane = this.panes.shift();
        this.counter++;
        console.log(this.activePane);
        if (this.activePane) {
            this.activePane.elem.classList.add('active');
        }
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
        
        this.setActivePane();
        
        
        if (!this.activePane) {
            this.closeOut();
                
        }
        
        //elem.style.width = self.panes[0].
        
        var width = this.activePane.elem.offsetWidth;
        this.querySelector('.quiz-wrapper').left({'transform':'translateX(' + (-1 * width  * this.counter) +'px)'});
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
    var quizPane = function(elem, answerSelector, parent) {
        var self = this;
        var elem = self.elem = elem;
        var answerElems = elem.querySelectorAll(answerSelector);
        
        self.parent = parent;
        self.submitted = false;
        self.result = 0;
        self.correct = elem.querySelector('.correct-answer').textContent;
        self.answers = [];
        
        quizAnswer.prototype.parent = parent;
        
        for (var i = 0; i < answerElems.length; i++) {
            self.answers.push(new quizAnswer(answerElems[i]));
        }
        
        //self.button = $this.find('button');
        //self.button.click(self.checkAnswer(self));
        //$this.on('click', 'li', this.selected(self));
        
        
    }


    quizPane.prototype.getWidth = function() {
        return this.$this.width();
    }
    
    quizPane.prototype.checkAnswer = function() {
            //this.activePane
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
    
    
    quizPane.prototype.isActive = function() {
        return this.$this.hasClass('active');
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
    
    
    
})(window);

var myfirstQuiz = new jsQuiz('.myfirstquiz');
//var mysecondQuiz = new jsQuiz('.mysecondquiz');
//console.log(myfirstQuiz);
//console.log(myfirstQuiz);



