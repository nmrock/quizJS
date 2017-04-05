
'use strict';

    
(function(global, myJquery) {
    
    //Polyfill
    //https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
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
    
    //http://stackoverflow.com/questions/6238351/fastest-way-to-detect-external-urls
    var isExternalRegexClosure = (function(){
        var domainRe = /https?:\/\/((?:[\w\d-]+\.)+[\w\d]{2,})/i;

        return function(url) {
            function domain(url) {
              return domainRe.exec(url);  
            }

            return domain(location.href) !== domain(url);
        }
    })();
    
    //http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    var shuffle = function(array) {
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
    
    //Checks elem and parent elems for a tag.
    //http://stackoverflow.com/questions/5540555/how-to-check-if-dom-textnode-is-a-link
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
    
    var buildElem = function(typeOfNode, classToAdd) {
        var newElem = global.document.createElement(typeOfNode);
        newElem.classList.add(classToAdd);
        return newElem;
    }
    
    var restart = function(currentQuiz) {
        currentQuiz.elem.innerHTML = currentQuiz.clone;
        currentQuiz.elem.removeEventListener('click', currentQuiz.clickHandler);
        var quizSelector = currentQuiz.quizSelector,
            paneSelector = currentQuiz.paneSelector,
            answerSelector = currentQuiz.answerSelector;
        var newQuiz = new jsQuiz(quizSelector, paneSelector, answerSelector);
        
        currentQuiz = {};
    }
    
    
    /* === CONSTRUCTORS === */
    var jsQuiz = function(quizSelector, paneSelector, answerSelector) {
        var self = this;
        this.quizSelector = quizSelector;
        this.paneSelector = paneSelector || '.quiz-pane';
        this.answerSelector = answerSelector || 'li';
        this.activePane = null;
        this.counter = -1;
        this.theResults = 0;
        this.clickHandler;
                
        var elem = this.elem = global.document.querySelector(quizSelector);
        this.clone = this.elem.innerHTML;
        this.buildQuizWrapper()
            .buildResultsPane()
            .buildCounterMessage();
        
        //Adding screen reader compatability
        elem.setAttribute('role', 'region');
        elem.setAttribute('aria-live', 'polite');
        
        this.panes = [];
        var paneElems = elem.querySelectorAll(this.paneSelector);
        for (var i = 0; i < paneElems.length; i++) {
            self.panes.push(
                new quizPane(
                    paneElems[i], 
                    this.answerSelector, 
                    self));
        }
        
        if (!self.panes.length) {
            console.error('No questions found!');
        }
        this.totalPanes = self.panes.length;
        
        self.panes[self.panes.length - 1].isLast = true;
        
        elem.style.width = self.panes[0].elem.offsetWidth + 'px';
        this.activePaneWidth = self.panes[0].elem.offsetWidth;
        
        //Calling closure to get clickHandler 
        this.clickHandler = this.createClickHandler();
        
        //Passing clickHandler to event listener. 
        //If we use an anonymous function instead of clickHandler, 
        //then we can't use removeEventListener (see restart function)
        elem.addEventListener('click', this.clickHandler);
        
        //Begin!
        self.setActivePane();    
    }

    var quizPane = function(elem, answerSelector, parent) {
        var self = this;
        var elem = this.elem = elem;
        elem.setAttribute('aria-hidden', 'true');
        this.correctElem = elem.querySelector('.correct-answer') || self.correctElem;
        this.message = this.getMessage();
        this.messageContent = this.message.innerHTML;

        this.buildAnswers(answerSelector);

        this.list = this.answers[0].parentNode;
        this.message.textContent = "";
        this.parent = parent;
        this.submitted = false;
        this.result = 0;
        this.correct = this.correctElem.textContent;
        
        //Clear away correct-answer attribute to make it a little harder for cheaters.
        this.correctElem.classList.remove('correct-answer');
        
        //Removing 'correct-answer' potentially leaves dangling class attribute. Validate and remove.
        if (self.correctElem.classList == "") {
            self.correctElem.removeAttribute('class');
        }
        
        //Re-order answers. This is optional, but useful if working with a CMS that prints
        //the correct answer in the same position each time 
        //(e.g. first answer option is always the correct one, etc.).
        this.shuffleAnswers();
    }
    
    /* === END CONSTRUCTORS === */
    
    /* === Prototype functions === */
        /* === jsQuiz Prototype functions === */
    
    jsQuiz.prototype.buildQuizWrapper = function() {
        this.quizWrapper = this.elem.querySelector('.quiz-wrapper');
        
        
        //If wrapper doesn't exist, create it.
        if (!this.quizWrapper) {         
            this.quizWrapper = buildElem('div', 'quiz-wrapper');
            this.quizWrapper.innerHTML = this.elem.innerHTML;
            this.elem.innerHTML = '';
            this.elem.appendChild(this.quizWrapper);
        }
        return this;
    }
    
    jsQuiz.prototype.buildResultsPane = function() {
        this.resultsPane = this.elem.querySelector('.quiz-results');
        
        //If results div doesn't exist, create it.
        if (!this.resultsPane) {
            this.resultsPane = buildElem('div', 'quiz-results'); 
            this.quizWrapper.appendChild(this.resultsPane);
        }
        
        this.resultsPane.setAttribute('aria-hidden', 'true');
        
        //Once results pane exists, ensure results message exists.
        //Return results to allow chaining.
        return this.buildResultsMessage();
        
    }
    
    jsQuiz.prototype.buildResultsMessage = function() {
        this.correctPlaceholder = this.elem.querySelector('.num-correct');
        this.totalPlaceholder = this.elem.querySelector('.num-total');
        
            //If they exist, return self to allow chaining.
            if (this.correctPlaceholder && this.totalPlaceholder) {
                return this;
            } else {
                //If they don't exist, create them.
                this.correctPlaceholder = buildElem('span', 'num-correct');
                this.totalPlaceholder = buildElem('span', 'num-total');
                var firstText = global.document.createTextNode("You got ");
                var afterCorrectText = global.document.createTextNode(" correct out of ");
                var afterTotalText = global.document.createTextNode(" total.");
                var messageNode = global.document.createElement('h4');
                var restartButton = buildElem('button', 'restart');
                
                messageNode.appendChild(firstText);
                messageNode.appendChild(this.correctPlaceholder);
                messageNode.appendChild(afterCorrectText);
                messageNode.appendChild(this.totalPlaceholder);
                messageNode.appendChild(afterTotalText);
                restartButton.appendChild(global.document.createTextNode('Restart?'));
                this.resultsPane.appendChild(messageNode);
                this.resultsPane.appendChild(restartButton);
                
                //Return self to allow chaining
                return this;
            }
    }
    
    jsQuiz.prototype.buildCounterMessage = function() {
        //
        this.counterMessage = this.elem.querySelector('.counter');        
        if (!this.counterMessage) {
            this.counterMessage = buildElem('div', 'counter');
            this.elem.insertBefore(this.counterMessage, this.quizWrapper);
        }
        
        //Return self to allow chaining
        return this;
    }
    
    
    //Using a closure to define self. 'This' is clicked element if clickHandler is passed directly.
    jsQuiz.prototype.createClickHandler = function() {
        var self = this;
        
        //return clickHandler function
        return function(e) {
            var elem = e.target

            //If the user clicked an answer option in the active pane
            //And they have not already submitted an answer, select the clicked elem
            if (self && self.activePane) {
                var test = self.activePane.submitted;
            }
            if (elem.matches('.active ' + self.answerSelector)
                && !test) {

                var prevSelected = self.activePane.elem.querySelector('.selected')
                if (prevSelected) {
                    prevSelected.classList.remove('selected');
                    prevSelected.setAttribute('aria-pressed', 'false');
                }

                elem.classList.add('selected');      
                elem.setAttribute('aria-pressed', 'true');
            }

            if (elem.matches('.active button'))
            {
                if (self.activePane.checkAnswer()) {
                    self.theResults++;
                }
            }

            if (elem.matches('.quiz-results button'))
            {
                restart(self);            
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
     }
     
    jsQuiz.prototype.setActivePane = function() {
        if (this.activePane) {
            this.activePane.elem.classList.remove('active');
            this.activePane.elem.setAttribute('aria-hidden', 'true');
        }
        this.activePane = this.panes.shift();
        this.counter++;
        this.counterMessage.textContent = "Question " + (this.counter + 1) + " out of " + this.totalPanes + ".";
        
        if (this.activePane) {
            this.activePane.elem.classList.add('active');
            this.activePane.elem.setAttribute('aria-hidden', 'false');
        }
    }

    //Increments to next question if it exists
    //Otherwise, calls closeOut and increments to quiz results pane.
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
        this.elem.querySelector('.quiz-results').setAttribute("aria-hidden", "false");
        this.correctPlaceholder.textContent = this.theResults;
        this.totalPlaceholder.textContent = this.totalPanes;
        
    }    
        /* === END jsQuiz Prototype functions === */
        /* === quizPane Prototype functions === */
        
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
                button.setAttribute("role", "submit");
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
            var button = this.button = this.elem.querySelector('button');
            var message = this.message;
            var messageContent = this.messageContent;
            if (!this.submitted) {
                var correct = this.correct;
                var selected = this.elem.querySelector('.selected');
                message.setAttribute('aria-hidden', 'false');
                if (!selected) {
                    message.textContent = "Please select an answer!";
                    return 0;
                }
                
                this.submitted = true;
                this.elem.classList.add('submitted');
                this.correctElem.classList.add('correct-post-submit');
                
                if (this.isLast) {
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
                this.parent.nextQuestion();
                return 0;
            }
        }
    
    quizPane.prototype.buildAnswers = function(answerSelector) {
        this.answers = this.elem.querySelectorAll(answerSelector);
        for (var i = 0; i < this.answers.length; i++) {
            this.answers[i].setAttribute('aria-pressed', 'false');
            this.answers[i].setAttribute('role', 'button');
        }
    }
        /* === END quizPane Prototype functions === */
    /* === END Prototype functions === */

    
    jsQuiz.init = function(quizSelector, paneSelector, answerSelector) {
        new jsQuiz(quizSelector, paneSelector, answerSelector);
    }
    
    global.jsQuiz = jsQuiz.init;
    
})(window);