
'use strict';

    
(function(global, myJquery) {
    
    if (!Element.prototype.matches) {
        Element.prototype.matches = 
            Element.prototype.matchesSelector || 
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector || 
            Element.prototype.oMatchesSelector || 
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;            
            };
    }
    
    var isExternalRegexClosure = (function(){
        var domainRe = /https?:\/\/((?:[\w\d-]+\.)+[\w\d]{2,})/i;

        return function(url) {
            function domain(url) {
              return domainRe.exec(url);  
            }

            return domain(location.href) !== domain(url);
        }
    })();
    
    var buildElem = function(typeOfNode, classToAdd) {
        var newElem = global.document.createElement(typeOfNode);
        newElem.classList.add(classToAdd);
        return newElem;
    }
     
    //Checks elem and parent elems for a tag.
     var isLink = function(elem) {
        var curNode = elem;
        while (curNode) {
            if (curNode.tagName == 'A') {
                return curNode;
            } else {
                curNode = curNode.parentNode;
            }
        }
        return false;
    }

    var jsQuiz = function(quizSelector, paneSelector, answerSelector) {
        var self = this;
        this.paneSelector = paneSelector || '.quiz-pane';
        this.answerSelector = answerSelector || 'li';
        this.activePane = null;
        this.counter = -1;
        this.theResults = 0;
                
        var elem = this.elem = global.document.querySelector(quizSelector);
        this.buildQuizWrapper()
            .buildResultsPane()
            .buildCounterMessage();
        this.panes = [];
        var paneElems = elem.querySelectorAll(this.paneSelector);
        console.log('answer selector is ' + this.answerSelector);
        console.log(this);
        console.log(paneElems);
        for (var i = 0; i < paneElems.length; i++) {
            self.panes.push(new quizPane(paneElems[i], this.answerSelector, self));
        }
        
        if (!self.panes.length) {
            console.error('No questions found!');
        }
        this.totalPanes = self.panes.length;
        
        self.panes[self.panes.length - 1].isLast = true;
        
        elem.style.width = self.panes[0].elem.offsetWidth + 'px';
        this.activePaneWidth = self.panes[0].elem.offsetWidth;
        
        elem.addEventListener('click', function(e) {self.clickHandler(e)});
        self.setActivePane();
    }

    
    jsQuiz.prototype.buildQuizWrapper = function() {
        this.quizWrapper = this.elem.querySelector('.quiz-wrapper');
        
        if (!this.quizWrapper) {         
            this.quizWrapper = buildElem('div', 'quiz-wrapper');
            this.quizWrapper.innerHTML = this.elem.innerHTML;
            this.elem.innerHTML = '';
            
            this.elem.appendChild(this.quizWrapper);
                
        }
        return this;
        
    }
    
    jsQuiz.prototype.buildResultsPane = function() {
        this.resultsPane = this.elem.querySelector('.quiz-results')
        if (!this.resultsPane) {
            console.log('building results pane');
            this.resultsPane = buildElem('div', 'quiz-results'); 
            this.quizWrapper.appendChild(this.resultsPane);
        }
        return this.buildResultsMessage();
        
    }
    
    jsQuiz.prototype.buildResultsMessage = function() {
        this.correctPlaceholder = this.elem.querySelector('.num-correct');
        this.totalPlaceholder = this.elem.querySelector('.num-total');
            if (this.correctPlaceholder && this.totalPlaceholder) {
                return this;
            } else {
                console.log('building results message');
                this.correctPlaceholder = buildElem('span', 'num-correct');
                this.totalPlaceholder = buildElem('span', 'num-total');
                var firstText = global.document.createTextNode("You got ");
                var afterCorrectText = global.document.createTextNode(" correct out of ");
                var afterTotalText = global.document.createTextNode(" total.");
                var messageNode = global.document.createElement('h4');
                messageNode.appendChild(firstText);
                messageNode.appendChild(this.correctPlaceholder);
                messageNode.appendChild(afterCorrectText);
                messageNode.appendChild(this.totalPlaceholder);
                messageNode.appendChild(afterTotalText);
                this.resultsPane.appendChild(messageNode);
                return this;
            }
    }
    
    jsQuiz.prototype.buildCounterMessage = function() {
        this.counterMessage = this.elem.querySelector('.counter');        
        if (!this.counterMessage) {
            this.counterMessage = buildElem('div', 'counter');
            this.elem.insertBefore(this.counterMessage, this.quizWrapper);
        }
    }
    
     jsQuiz.prototype.clickHandler = function(e) {
        
        var elem = e.target
        
        //If the user clicked an answer option in the active pane
        //And they have not already submitted an answer, select the clicked elem
        if (elem.matches('.active ' + this.answerSelector)
            && !this.activePane.submitted) {
           
            var prevSelected = this.activePane.elem.querySelector('.selected')
            if (prevSelected) {
                prevSelected.classList.remove('selected');
            }
            
            elem.classList.add('selected');      
        }
        
        if (elem.matches('.active button'))
            {
                if (this.activePane.checkAnswer()) {
                    this.theResults++;
                }
              //  this.nextQuestion();
            }
             // Leaving site notice
            var linkElem = isLink(elem)
            if (linkElem) {
                if (isExternalRegexClosure(linkElem.href)) {
                    var linkedUrl = linkElem.host.split('.');
                    if (linkedUrl.length > 1) {
                        var topLevelDomain = linkedUrl[linkedUrl.length - 1];
                        if (topLevelDomain !== "gov" && topLevelDomain != "mil") {
                            var siteName = document.title.split('|').pop().trim() || 'our site';
                            if (confirm('Thank you for visiting ' + siteName + '. You are now leaving the site. We do not exercise control over the content of external websites. Click OK to continue.')) {

                            } else {
                                e.preventDefault();
                            }
                        }
                    }
                }
            }
    }

     
    jsQuiz.prototype.setActivePane = function() {
        
        if (this.activePane) {
            this.activePane.elem.classList.remove('active');
        }
        this.activePane = this.panes.shift();
        this.counter++;
        this.counterMessage.textContent = "Question " + (this.counter + 1) + " out of " + this.totalPanes + ".";
        
        if (this.activePane) {
            this.activePane.elem.classList.add('active');
        }
    }
    
    
    jsQuiz.prototype.howManyCorrect = function() {
        return this.theResults;
    }

    //Increments to next question if it exists
    //Otherwise, increments to quiz results pane and calls closeOut.
    jsQuiz.prototype.nextQuestion = function() {
        
        this.setActivePane();
        
        
        
        if (!this.activePane) {
            this.closeOut();
                
        }
        
        
        var width = this.activePaneWidth;

        this.quizWrapper.style.transform = 'translateX(' + (-1 * width  * this.counter) +'px)';
    }
    
    jsQuiz.prototype.closeOut = function() {
        this.counterMessage.textContent = "";       
        
        this.correctPlaceholder.textContent = this.howManyCorrect();
        this.totalPlaceholder.textContent = this.totalPanes;
    }
    
    jsQuiz.prototype.howManyTotal = function() {
        return this.panes.length;
    }
    
    
    var quizPane = function(elem, answerSelector, parent) {
        var self = this;
        var elem = self.elem = elem;
        this.correctElem = elem.querySelector('.correct-answer') || self.correctElem;
        this.message = this.getMessage();
        this.messageContent = this.message.innerHTML;
        this.answers = elem.querySelectorAll(answerSelector);
        this.list = this.answers[0].parentNode;
        this.message.textContent = "";
        self.parent = parent;
        self.submitted = false;
        self.result = 0;
        self.correct = this.correctElem.textContent;
        this.correctElem.classList.remove('correct-answer');
        if (self.correctElem.classList == "") {
            self.correctElem.removeAttribute('class');
        }
        

        this.shuffleAnswers();
    }
    
    //Using prototype chain to handle undefined correctElem
    quizPane.prototype.correctElem = {
        textContent: '',
        classList: {remove : function() {this.throwError(); },
                   add : function() {this.throwError()},
                   throwError : function() { console.error('Error! Correct answer not set!');}
                   }
        
    }
    

    quizPane.prototype.getMessage = function() {
        var message = this.elem.querySelector('.message');
        if (message) {
            return message;
        } else {
            var newMessage = global.document.createElement('div');
            newMessage.classList.add('message');
            var button = this.elem.querySelector('button');
            
            if (!button) {
                button = buildElem('button', '.btn');
                button.appendChild(global.document.createTextNode('Submit'));
                this.elem.appendChild(button);
            }
            this.elem.insertBefore(newMessage, button);
            return newMessage;
        }
    }
    
    quizPane.prototype.shuffleAnswers = function() {
        if (this.list && this.list.children && this.list.children.length) {
            for (var i = this.answers.length; i >= 0; i--) {
                this.list.appendChild(this.list.children[Math.random() * i | 0]);
            }
        } else {
            console.error("Could not shuffle answers, missing answer answer-option list in the following node:");
            console.error(this);
        }
    }

    quizPane.prototype.checkAnswer = function() {
            var self = this;
            var button = self.button = self.elem.querySelector('button');
            var message = self.message;
            var messageContent = self.messageContent;
            if (!self.submitted) {
                var correct = self.correct;
                var selected = self.elem.querySelector('.selected');
                
                if (!selected) {
                    message.textContent = "Please select an answer!";
                    return 0;
                }
                
                self.submitted = true;
                self.elem.classList.add('submitted');
                self.correctElem.classList.add('correct-post-submit');
                
                if (self.isLast) {
                    button.textContent = 'Show Results';
                } else {
                    button.textContent = 'Next Question';
                }
                
                if (correct === selected.textContent) {
                    message.innerHTML = "<span class='correct'>Correct.</span><br>" + messageContent;                    
                    return 1
                } else {
                    message.innerHTML = "<span class='incorrect'>Incorrect.</span><br>" + messageContent;
                    return 0
                }

                
            } else {
                self.parent.nextQuestion();
                return 0;
            }
        }
    

    
    jsQuiz.init = function(quizSelector, paneSelector, answerSelector) {
        new jsQuiz(quizSelector, paneSelector, answerSelector);
    }
 
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
    
    global.jsQuiz = jsQuiz.init;
    
    
})(window);



