(function($){
    if(!$.Indextank){
        $.Indextank = new Object();
    };
    
    $.Indextank.Autocomplete = function(el, options){
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;


        
        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
//        console.log(base.el.style.width);
//        base.el.style.width += 5;
//        console.log(base.el.style.width);
//
        // Add a reverse reference to the DOM object
        base.$el.data("Indextank.Autocomplete", base);
        
        base.init = function(){
            base.options = $.extend({},$.Indextank.Autocomplete.defaultOptions, options);
            
            // Put your initialization code here
//            console.log(base.el.style.width);
//            base.el.form.style.width = '100%';
            var ize = $(base.el.form).data("Indextank.Ize");
//            ize.$el[0][0].setWidth(500);
//            console.log(ize.$el[0][0].clientWidth);

            base.$el.autocomplete({
                select: function( event, ui ) {
                            event.target.value = ui.item.value;
                            // wrap form into a jQuery object, so submit honors onsubmit.
                            //$(event.target.form).submit();
                        },
                source: function ( request, responseCallback ) {
                            $.ajax( {
                                url: ize.apiurl + "/v1/indexes/" + ize.indexName + "/autocomplete",
                                dataType: "jsonp",
                                data: { query: request.term, field: base.options.fieldName },
                                success: function( data ) {responseCallback(data.suggestions.splice(0,4)); base.$el.trigger("Indextank.Autocomplete.success", [data.suggestions]); }
                            } );
                        },
                minLength: base.options.minLength,
                delay: base.options.delay
            });

//            make sure autocomplete closes when IndextankIzed form submits
            ize.$el.submit(function(e){
                base.$el.data("autocomplete").close();
            });

            // and also disable it when Indextank.AjaxSearch is searching .. 
            base.$el.bind("Indextank.AjaxSearch.searching", function(e) {
                // hacky way to abort a request on jquery.ui.autocomplete.
                //base.$el.data("autocomplete").disable();
                //window.setTimeout(function(){base.$el.data("autocomplete").enable();}, 1000);
            });
        };
        
        // Sample Function, Uncomment to use
        // base.functionName = function(paramaters){
        // 
        // };
        
        // Run initializer
        base.init();
    };
    
    $.Indextank.Autocomplete.defaultOptions = {
        fieldName: "text",
        minLength: 1,
        delay: 100
    };
    
    $.fn.indextank_Autocomplete = function(options){
        return this.each(function(){
            (new $.Indextank.Autocomplete(this, options));
        });
    };
    
    // This function breaks the chain, but returns
    // the Indextank.autocomplete if it has been attached to the object.
    $.fn.getIndextank_Autocomplete = function(){
        this.data("Indextank.Autocomplete");
    };
    
})(jQuery);
