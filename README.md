JIROjs
==========
JIROjs is a jQuery plugin that allows you to make responsive javascript. 
Respond to width, height, scroll or something custom. JIROjs handles 
initialisation, ordering and execution of custom JavaScript in response 
to all or one of these.

- Flexible yet powerful
- A great accompaniment to css media queries
- Responsive web design has never been so easy
- The free and open source JIROjs makes any responsive design a joy to 
  implement


Only ~4.6KB when minified and ~1.7KB minified and gzipped!

###Demos
Horizontal menu to drop down. (To Do)  
Side menu that follows when scrolled. (To Do)  
Text that scales up for bigger divs. (To Do)  

How to use me
--------------
JIROjs is a jquery plugin and initialising it is simple.

Insert after jQuery like this:
```html
<!-- jQuery -->
	<script type="text/javascript" src="scripts/jquery-x.x.x.min.js"></script>
<!-- jiro -->
	<script type="text/javascript" src="jiro-1.1.0.min.js"></script>
```
Make sure the objects being used have been loaded by the browser.

After that you can use one of three simple methods to achieve the 
results you want.

###Methods

####Switch method
```JavaScript
$(selector).jiro('addSwitch',breakPoint,{over:function,under:function});

$(selector).jiro('addSwitch',{bp:breakPoint,*options*},{over:function,under:function});
```

This lets you run a function when the property (default is width) goes 
over or under the given 'break point'.

**options**  
event  
_default_ event:'resize'  
Allows you to specify the event that triggers execution of the function 
argument. Always a string.

e.g
```JavaScript
function displayWidth(){
	return function(event){
		var $this=this;
		$this.text($this.width());
	}
}
```

Note the use of 'this' to refer to the target element specified in the 
jQuery selector.

prop  
_default_ prop:'width'  
Allows you to set which property is monitored for triggering of under 
and over breakpoints. This is a string representing a function that 
returns a number. The function has to be a child of the jQuery function. 
For example 'width' represents $.fn.wdth(). If you want to use a custom 
function you can, you just have to make it a child of $.fn.jiro.custom 
e.g.

```JavaScript
$.fn.jiro.custom.halfWidth=function(){
	return $(this).width()/2;
}
$('#target').jiro('addCont',function,{prop:'jiro.custom.halfWidth'});
```

Also the use of 'this' to refers to the target element specified in the 
jQuery selector.

capture  
_default_ capture:window  
Allows you to set which element to capture the events on. Default is 
window (for now). This is a catch all default. It is recommended to have 
this set at the lowest possible element like the element you are 
targeting. This is not always possible as events like 'resize' always 
originate at the window level (and events bubble up, not down).

This is useful if you want to capture the scroll of a div, for example. 
In that case you can set capture to that element and avoid unnecessary 
calls.

Also accepts 'this', which makes this the same as the target specified 
in the jQuery selector.


####Continuous method
```JavaScript
$(selector).jiro('addCont',function,{*options*});
```

Lets you add a function to run continuously between two breakpoints. 
Or one or no breakpoints.

**options**  
(Same as switch plus):

under  
_default_ not set  
Allows you to specify an upper limit for the function to operate at.

e.g.
```JavaScript
$('#target').jiro('addCont',function,{under:580});
```

The function will not continue to be triggered when property is above 580.

over  
_default_ not set  
Allows you to specify a lower limit for the function to operate at.

e.g.
```JavaScript
$('#target').jiro('addCont',function,{over:460});
```

The function will not continue to be triggered when property is below 460.

####Step method
```JavaScript
$(selector).jiro('addStep',
	{elem:element,prop:function},
	{over:{bp:val,bp2:val2,...limit:'current'},
	 under:{bp:val,bp2:val2,...limit:'current'},
	 *options*}
);
````
```JavaScript
$(selector).jiro('addStep',
	{elem:element,css:property},
	{over:{bp:val,bp2:val2,...limit:'current'},
	 under:{bp:val,bp2:val2,...limit:'current'},
	 *options*}
);
```
```JavaScript
$(selector).jiro('addStep',
	{getter:function,setter:function},
	{over:{bp:val,bp2:val2,...limit:'current'},
	 under:{bp:val,bp2:val2,...limit:'current'},
	 *options*}
);
```

Lets you change to a range of different values at different breakpoints for a specified property.

**Options**  
Same as switch

###Upcoming features
breakpoints sync'ed with CSS @media
trickel down resize event-wormholes!?(instead of bubbeling up)

License
---------
This Source Code Form is subject to the terms of the Mozilla Public 
License, v. 2.0. If a copy of the MPL was not distributed with this 
file, You can obtain one at http://mozilla.org/MPL/2.0/.