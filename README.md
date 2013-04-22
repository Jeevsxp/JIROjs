JIRO-0.2.1 reference
==================
Insert after jQuery

<!-- jQuery -->
		<script type="text/javascript" src="scripts/jquery-1.9.1.min.js"></script>
<!-- jiro -->
	<script type="text/javascript"src="jiro-0.2.1.min.js"></script>

Make sure the objects being used have been loaded by the browser.

Methods
----------
continuous:
over/under values are optional
examples:

	$(selector).('jiro.addCont',function,{under:breakPoint,over:breakPoint});
	$(selector).('jiro.addCont',function,{width:{under:breakPoint,over:breakPoint},height:{under:breakPoint,over:breakPoint});

switch:
needs a toggel function or seperate over,under functions
examples:

	$(selector).jiro.('addSwitch',breakPoint,{toggle:function}or{over:function,under:function});
	$(selector).jiro.('addSwitch',breakPoint,{toggle:function}or{over:function,under:function});

stepped switch:
limit is 'current' by default
examples:

	$(selector).jiro.('addStep',
		{elem:element,prop/css:property}or{getter:function,setter:function},
		{over:{bp:val,bp2:val2,...limit:'current'},under:{bp:val,bp2:val2,...limit:'current'}
	);

Upcoming features
--------------------
auto method detection
do now option, for ajax calls before the dom loads
obj and selector support
respond to height
trickel down resize events-wormholes!?(instead of bubbeling up)