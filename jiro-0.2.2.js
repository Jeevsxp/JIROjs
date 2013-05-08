/* Project:	JIRO - Jeevan's Incredible Responsive Object
 * Author:	Jeevan Khaira
 * Copyright:	(c) 2013 Jeevan Khaira -
 * 	This Source Code Form is subject to the terms of the Mozilla Public
 * 	License, v. 2.0. If a copy of the MPL was not distributed with this
 * 	file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
/*jslint forin: true, plusplus: true, sloppy: true, white: true */
(function($){
	var jiro={};
	jiro.common={
		sortFunc:function (prop){
			return function(a,b){
				return a[prop]-b[prop];
			};
		},
		toArray:function(obj){
			var prop,array=[];
			for(prop in obj){
				prop=parseInt(prop,10);
				if(obj.hasOwnProperty(prop)&&!(isNaN(prop))){
					array.push({key:prop,value:obj[prop]});
				}
			}
			return array.sort(jiro.common.sortFunc('key'));
		}
	};
	jiro.model={
		test:0,
		actionAppend:function(action){
			this.each(function(){
				var $this=$(this);
				if(!($this.data('jiro'))){
					$this.data('jiro',{actions:[],pointer:0,waitingForInit:true});
					$(window).one('init.jiro',{obj:$this},jiro.view.init);
				}else if(!($this.data('jiro').waitingForInit)){
					$this.data('jiro').waitingForInit=true;
					$(window).one('init.jiro',{obj:$this},jiro.view.set);
				}
				$this.data('jiro').actions.push(action);
			});
			/*jiro.model.actionAppend({
				breakPoint:breakPoint,
				overFunction:overFunction,
				underFunction:underFunction
			});*/
		},
		styleBuffer:[],
		stylishAppend:function(stylish){
			if(jiro.view.documentReady){
				jiro.model.stylishToAction.call(this,stylish);
			}else{
				stylish.obj=this;
				jiro.model.styleBuffer.push(stylish);
			}
			/*jiro.model.stylishAppend({
				breakPoint:action.breakPoint,
				property:action.property,
				over:action.over,
				under:action.under
			});*/
		},
		stylishToAction:function(stylish){
			var current=stylish.property.getter();
			jiro.model.actionAppend.call(this,{
				breakPoint:stylish.breakPoint,
				overFunction:function(){return stylish.property.setter((stylish.over==='current')?current:stylish.over);},
				underFunction:function(){return stylish.property.setter((stylish.under==='current')?current:stylish.under);}
			});
		},
		unbuffer:function(){
			function unbuffer(array,handler){
				var $this;
				while(array.length>0){
					$this=array.pop();
					handler.call($this.obj,$this);
				}
			}
			unbuffer(jiro.model.styleBuffer,jiro.model.stylishToAction);
		}
	};
	jiro.view={
		documentReady:false,
		set:function(event){
			var i,j,$this=event.data.obj,obj=$this.data('jiro');
			obj.actions.sort(jiro.common.sortFunc('breakPoint'));
			obj.waitingForInit=false;
			for(i=0;(i<obj.actions.length)&&(obj.actions[i].breakPoint<$this.width());i++){
				obj.actions[i].overFunction(event);
			}
			obj.pointer=i;
			for(j=obj.actions.length;(j>0)&&(j>i);j--){
				obj.actions[j-1].underFunction(event);
			}
		},
		init:function(event){
			jiro.view.set(event);
			$(window).on('resize.jiro',{object:event.data.obj},jiro.view.iterate);
		},
		iterate:function(event){
			var i,$this=event.data.object,obj=$this.data('jiro');
			for(i=obj.pointer;(i<obj.actions.length)&&(obj.actions[i].breakPoint<$this.width());i++){
				obj.actions[i].overFunction(event);
			}
			for(null;(i>0)&&(obj.actions[i-1].breakPoint>=$this.width());i--){
				obj.actions[i-1].underFunction(event);
			}
			obj.pointer=i;
		},
		load:$(document).ready(function(){
			jiro.view.documentReady=true;
			jiro.model.unbuffer();
			$(window).trigger('init.jiro');
		})
	};
	jiro.user={
		addSwitch:function(breakPoint,func){
			if('toggle'in func)jiro.model.actionAppend.call(this,{breakPoint:breakPoint,overFunction:func.toggle,underFunction:func.toggle});
			else jiro.model.actionAppend.call(this,{breakPoint:breakPoint,overFunction:func.over,underFunction:func.under});
		},
		addCont:function(func,breakPoints){
		var $this=this;
			function toggle(state,funct){
				$(document)[state]('ready.jiro',{obj:$this},funct);
				$(window)[state]('resize.jiro',{obj:$this},funct);
			}
			if(arguments.length>1){
				if('over'in breakPoints){
					jiro.model.actionAppend.call($this,breakPoints.over,toggle('off',func),toggle('on',func));}
				if('under'in breakPoints){
					jiro.model.actionAppend.call($this,breakPoints.under,toggle('on',func),toggle('off',func));}
			}else toggle('on',func);
		},
		addStep:function(property,values){
			var array={},limit;
			if(!('getter'in property)&&('css'in property)){
				property.getter=function(){return $(property.elem).css(property.css);};
			}else{
				property.getter=function(){return $(property.elem)[property.prop]();};
			}
			if(!('setter'in property)&&('css'in property)){
				property.setter=function(val){return $(property.elem).css(property.css,val);};
			}else{
				property.setter=function(val){return $(property.elem)[property.prop](val);};
			}
			function append(bp,overValue,underValue){
				if((overValue==='current')||(underValue==='current')){
					jiro.model.stylishAppend.call(this,{
						breakPoint:bp,
						property:{
							getter:function(){return property.getter();},
							setter:function(val){return property.setter(val);}},
						over:overValue,
						under:underValue
					});
				}else{
					jiro.model.actionAppend.call(this,{
						breakPoint:bp,
						overFunction:function(){return property.setter(overValue);},
						underFunction:function(){return property.setter(underValue);}
					});
				}
			}
			function toActions(arr,underVal,j){
				var i,overVal;
				for(i=0;(i+j)<arr.length;i++){
					overVal=arr[i+j].value;
					append.call(this,arr[i].key,overVal,underVal);
					underVal=overVal;
				}
			}		
			if('over'in values){
				array.over=jiro.common.toArray(values.over);
				limit=('limit' in values.over)?values.over.limit:'current';
				toActions.call(this,array.over,limit,0);
			}
			if('under'in values){
				array.under=jiro.common.toArray(values.under);
				toActions.call(this,array.under,array.under[0].value,1);
				limit=('limit' in values.under)?values.under.limit:'current';
				append.call(this,array.under[array.under.length-1].key,limit,array.under[array.under.length-1].value);
			}
		}
	};
	$.fn.jiro=function(method){	
		if(jiro.user[method]){
			jiro.user[method].apply(this,Array.prototype.slice.call(arguments,1));
			if(jiro.view.documentReady)$(window).trigger('init.jiro');
		}else{
			console.log('Method "'+method+'" does not exist in jQuery.jiro');
		}
		return this;
	};
})(jQuery);