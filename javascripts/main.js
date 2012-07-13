(function(){
    var router;
    function initialize(){
        setupSyntaxHighlighter();
        setupCodeAreaAction();

        router = new Backskin.Router(); //please use the new automatic router
        Backbone.history.start(); //please still call Backbone's facility here
    }

    function setupSyntaxHighlighter(){
        SyntaxHighlighter.defaults['gutter'] = false;
        SyntaxHighlighter.defaults['toolbar'] = false;
        SyntaxHighlighter.autoloader(
            'js jscript javascript	javascripts/SyntaxHighlighter/shBrushJScript.js',
            'php					javascripts/SyntaxHighlighter/shBrushPhp.js',
            'text plain				javascripts/SyntaxHighlighter/shBrushPlain.js',
            'xml xhtml xslt html	javascripts/SyntaxHighlighter/shBrushXml.js'
        );

        SyntaxHighlighter.all();
    }

    function setupCodeAreaAction(){

        function test(){
            if( $('[class^="brush"]').length !== 0){
                setTimeout(test, 100);
            }else{
                op();
            }
        }
        setTimeout(test, 100);

        function op(){
            $('.syntaxhighlighter').each(function(i, e){
                var $element = $(e);
                $element.css('position', 'absolute');
                var wrapper = $element.parent();
                wrapper.css('position', 'relative');
                wrapper.height($element.height());
                wrapper.width($element.width());

                $.each(['marginLeft','marginRight','marginTop','marginBottom'], function(i, e){
                    wrapper.css(e, $element.css(e));
                    $element.css(e, 0);
                });

                var currentWidth = $element.width();
                var width = calculateWidth($element);

                $element.on('mouseover', (function($element, currentWidth, maxWidth){
                    return function(){
                        var padding = 15;
                        $element.css('padding', 15);
                        var width = maxWidth + (padding * 2);
                        width = Math.min($(window).width(), width);
                        if(currentWidth < width){
                            $element.width(width);
                            $element.css('left', (currentWidth - width) / 2 );
                        }else{
                            $element.css('left', -padding-1 );
                        }
                        $element.css('top', -padding-1 );
                    }
                }($element, currentWidth, width)));

                $element.on('mouseout', (function($element, currentWidth, maxWidth){
                    return function(){
                        $element.css('padding', 0);
                        $element.width(currentWidth);
                        $element.css('left', 0 );
                        $element.css('top', 0 );

                    }
                }($element, currentWidth, width)));
            });
        }

        function calculateWidth($element){
            return Math.max.apply(Math, $.map($element.find('td div.container div.line'), function( e ){
                return Array.prototype.reduce.call($(e).find('code').map(function(i, e){
                    return $(e).outerWidth();
                }), function(a, b){return a + b;}, 0 );
            })) ;
        }
    }


    $(document).ready(initialize);

    /**
     * Getting Started
     */
    var Controller1 = Backskin.Controller.extend({
        name: 'ctrl1', /* the only mandatory field */

        /**
         * This is a common action method, it is invoked
         * automatically if url matches
         */
        hello: function(){
            alert('Hello world!');
        },

        helloInChinese: function(){
            //you can invoke any method in this controller (including the private methods for sure)
            this._privateMethod();
        },

        /**
         * This function will remain untouched, the router cannot see
         * this method
         */
        _privateMethod: function(){
            alert('你好世界!');
        }
    });

    /**
     * Action Mapping
     */
    Backskin.Controller.extend({
        name: 'my_controller', /* the only mandatory field */

        'my-method': function(how, when){
            var phrase = how + ' ' + (when || 'unknown');
            this._output(phrase);
        },

        _output: function(string){
            $('#area1').append($('<div>' + string + '</div>'));
        }
    });

    /**
     * Asynchronouse calls
     */
    var AsynchronousController = Backskin.Controller.extend({
        name: 'asynchronous', /* the only mandatory field */

        'method': function(){
            var deferred = new $.Deferred();

            var colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'];
            var index = 0;

            var instance = this;
            (function op(){
                if(index < colors.length){
                    instance._changeColor(colors[index++]);
                    setTimeout(op, 567);
                }else{
                    deferred.resolve();
                }
            })();
            return deferred;
        },

        _changeColor: function(color){
            $('#area2').css('background-color', color);
        }
    });

    window['procedure1'] = function(){
        var r = router.navigate('asynchronous/method', {trigger:true, replace: false});
        r.done(function(){
            $('#area2').html('Nice I change to white!');
            (new AsynchronousController())._changeColor('white');
        });
    };

    /**
     * Event hooks
     */
    Backskin.Controller.extend({
        name: 'event_hooks', /* the only mandatory field */

        beforeFilter: function(){
            this._report('beforeFilter invoked');
        },

        method1: function(){
            this._report('method1 invoked');
        },

        method2: function(){
            var index = 0;
            var instance = this;
            var deferred = new $.Deferred();
            (function op(){
                if(index ++ < 5){
                    instance._report(index);
                    setTimeout(op, 345);
                }else{
                    deferred.resolve();
                }
            })();
            return deferred;
        },

        afterRender: function(){
            this._report('afterRender invoked');
        },

        _report: function(text){
            $('#area3').append('<div>' + text + '</div>');
        }
    });

    var EventHooks1= Backskin.Controller.extend({
        name: 'event_hooks1', /* the only mandatory field */

        beforeFilter: function(){
            this._report('beforeFilter invoked');
            //always successful (can also be achieved if return nothing)
            return true;
        },

        method1: function(){
            this._report('method1 invoked');
            var deferred = new $.Deferred();

            var colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'];
            var index = 0;

            var instance = this;
            (function op(){
                if(index < colors.length){
                    instance._changeColor(colors[index++]);
                    setTimeout(op, 234);
                }else{
                    deferred.resolve();
                }
            })();
            return deferred;
        },

        method2: function(){
            this._changeColor('MidnightBlue');
            this._report('method2 invoked');
            this._report('afterRender won\'t be executed');
            return false; // a false value, the subsequent method gets no chance to be executed
        },

        method3: function(){
            this._changeColor('Indigo');
            this._report('method3 invoked');
            this._report('afterRender will be executed');
            // return nothing has the same effect as returning true
        },

        afterRender: function(){
            // reject, so the call chain will eventually fail even though the
            // main action method is executed
            this._report('afterRender invoked');
            return (new $.Deferred()).reject();
        },

        _report: function(text){
            $('#area4').append('<div>' + text + '</div>');
        },

        _changeColor: function(color){
            $('#area4').css('backgroundColor', color);
        }
    });

    window['procedure2'] = function(){
        var r = router.navigate('event_hooks1/method2', {trigger:true, replace: false});
        r.done(function(){
            (new EventHooks1())._report('procedure2 successful');
        }).fail(function(){
            (new EventHooks1())._report('procedure2 failed');
        });
    };

    window['procedure3'] = function(){
        var r = router.navigate('event_hooks1/method3', {trigger:true, replace: false});
        r.done(function(){
            (new EventHooks1())._report('procedure3 successful');
        }).fail(function(){
            (new EventHooks1())._report('procedure3 failed');
        });
    };

    Backskin.Controller.extend({
        name: 'session_enabled', /* the only mandatory field */

        beforeFilter: function(){
            this._report('beforeFilter invoked');
            return true;
        },

        checkSession: function(){
            this._report('checkSession invoked');

            var deferred = new $.Deferred();

            var instance = this;
            setTimeout(function(){
                instance._report('session is valid!');
                deferred.resolve();
            }, 2000);
            return deferred;
        },

        user_method1: function(){
            this._report('method1 invoked');
        },

        user_method2: function(){
            this._report('secure method2 invoked');
            this._changeColor('green');
        },

        method2: function(){
            this._report('normal method2 invoked');
            this._changeColor('DimGray');
        },

        _report: function(text){
            $('#area5').append('<div>' + text + '</div>');
        },

        _changeColor: function(color){
            $('#area5').css('backgroundColor', color);
        }
    });

})();

