window.fbAsyncInit = function() {
    
  FB.init({ appId : '{{ app_id }}', status : true, cookie : true, xfbml : true });

  FB.Event.subscribe('{% if current_user %}auth.logout{% else %}auth.login{% endif %}', function(response) {      
     {% if current_user %} window.location = "/logout" {% else %} window.location.reload(); {% endif %}
  });

  // FB.Canvas.setAutoGrow();
};


(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// (function() {
//     var e = document.createElement('script');
//     e.type = 'text/javascript';
//     e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
//     e.async = true;
//     document.getElementById('fb-root').appendChild(e);
// }());