/* Project:	JIRO - Jeevan's Incredible Responsive Object
 * Author:	Jeevan Khaira
 * Copyright:	(c) 2013 Jeevan Khaira -
 * 	This Source Code Form is subject to the terms of the Mozilla Public
 * 	License, v. 2.0. If a copy of the MPL was not distributed with this
 * 	file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 
/*jslint browser: true, devel: true, forin: true, plusplus: true, sloppy: true, white: true */
(function($){
	var jiro={};
	jiro.common={
		sortFunc:function(prop){
			return function(a,b){
				return a[prop]-b[prop];
			};
		},
		objectToArray:function(obj){
			var prop,array=[];
			for(prop in obj){
				prop=parseInt(prop,10);
				if(obj.hasOwnProperty(prop)&&!(isNaN(prop))){
					array.push({key:prop,value:obj[prop]});
				}
			}
			return array.sort(jiro.common.sortFunc('key'));
		},
		stringToFunction:function(string){
			var array,func,i;
			array=string.split('.');
			func=$.fn[array[0]];
			for(i=1;i<array.length;i++){
				func=func[array[i]];
			}
			return func;
		},
		addThis:function(thiss,func){
			return function(){
				return func.call(thiss);
			};
		}
	};
	jiro.model={
		defaults:{event:'resize',prop:'width',capture:window},
		actionAppendSettings:function(settings){
			var options={};
			settings=(settings===undefined)?{}:settings;
			options.event=settings.event||jiro.model.defaults.event;
			options.prop=settings.prop||jiro.model.defaults.prop;
			if(settings.capture==='this'){
				options.capture=this;
			}else{
				options.capture=settings.capture||jiro.model.defaults.capture;
				options.capture=$(options.capture);
			}
			options.propFunc=jiro.common.stringToFunction(options.prop);
			options.propFunc=jiro.common.addThis(this,options.propFunc);
			return options;
		},
		actionAppend:function(action,settings){			
			this.each(function(){
				var $this,obj,options,data,climbed,node,createNode=[];
				$this=$(this);
				obj=$this.data();
				options={capture:settings.capture,event:settings.event};
				data={prevPropValue:0,actions:[],pointer:0,propFunc:settings.propFunc,waitingForInit:true,settings:options};
				climbed=0;
				node=['jiro','responsive',settings.capture,settings.event,settings.prop];
				createNode[5]=function(){obj[node[0]]={};};
				createNode[4]=function(){obj[node[0]][node[1]]={};};
				createNode[3]=function(){obj[node[0]][node[1]][node[2]]={};};
				createNode[2]=function(){obj[node[0]][node[1]][node[2]][node[3]]={};};
				createNode[1]=function(){obj[node[0]][node[1]][node[2]][node[3]][node[4]]=data;};
				createNode[0]=function(){
					var dataObj=obj[node[0]][node[1]][node[2]][node[3]][node[4]];
					dataObj.actions=dataObj.actions.concat(action);
				};
				(function tryCatch(i){
					try{
						createNode[i]();
						i-=1;
						if(i>=0){
							tryCatch(i);
						}
					}
					catch(err){
						i+=1;
						climbed=i;
						if(i<createNode.length){
							tryCatch(i);
						}
					}
				})(0);
				data={objData:obj[node[0]][node[1]][node[2]][node[3]][node[4]]};
				if(climbed>0){
					settings.capture.one('init.jiro',data,jiro.view.init);
				}else if(!(data.objData.waitingForInit)){
					data.objData.waitingForInit=true;
					settings.capture.one('init.jiro',data,jiro.view.set);
				}
			});
			/*jiro.model.actionAppend({
				breakPoint:breakPoint,
				overFunction:overFunction,
				underFunction:underFunction
			},{
				event:event,
				prop:propertyString,
				capture:captureElement,
				propFunc:propertyFunction
			});*/
		}
	};
	jiro.view={
		set:function(event){
			var i,j,propValue,obj=event.data.objData;		
			obj.actions.sort(jiro.common.sortFunc('breakPoint'));	
			propValue=obj.propFunc();			
			for(i=0;(i<obj.actions.length)&&(propValue>=obj.actions[i].breakPoint);i++){
				obj.actions[i].overFunction();
			}
			for(j=obj.actions.length;(j>0)&&(j>i);j--){
				obj.actions[j-1].underFunction();
			}
			obj.pointer=i;
			obj.prevPropValue=propValue;
			obj.waitingForInit=false;
		},
		iterate:function(event){
			var i,propValue,obj=event.data.objData;
			propValue=obj.propFunc();
			if(propValue>obj.prevPropValue){
				for(i=obj.pointer;(i<obj.actions.length)&&(propValue>=obj.actions[i].breakPoint);i++){		
					obj.actions[i].overFunction();
				}
			}else{
				for(i=obj.pointer;(i>0)&&(propValue<=obj.actions[i-1].breakPoint);i--){
					obj.actions[i-1].underFunction();
				}
			}
			obj.pointer=i;
			obj.prevPropValue=propValue;
		},
		init:function(event){
			var obj=event.data.objData.settings;
			jiro.view.set(event);
			obj.capture.on(obj.event+'.jiro',event.data,jiro.view.iterate);
		}
	};
	jiro.css={
		save:function(cssProperties){
			var property,i,data,cssObj,$this=this;
			data=$this.data('jiro');
			if(data===undefined){
				$this.data('jiro',{css:{}});
				data=$this.data('jiro');
			}else if(!(data.hasOwnProperty('css'))){
				data.css={};
			}
			cssObj={};
			for(i=0;i<cssProperties.length;i++){
				property=cssProperties[i];
				cssObj[property]=$this.css(property);
			}
			data.css=$.extend(cssObj,data.css);
		},
		object:function(cssObj){
			var cssProperties=[],prop,$this=this;
			for(prop in cssObj){
				if(cssObj.hasOwnProperty(prop)){
					cssProperties.push(prop);
				}
			}
			jiro.css.save.call($this,cssProperties);
			$this.css(cssObj);
		},
		string:function(cssProp,value){
			var $this=this;
			jiro.css.save.call($this,[cssProp]);
			$this.css(cssProp,value);
		}
	};
	jiro.user={
		addSwitch:function(response,func){
			var breakPoint,settings,action,$this=this;
			action={};
			if(typeof response==='number'){
				breakPoint=response;
				settings=jiro.model.actionAppendSettings.call($this,{});
			}else{
				breakPoint=response.bp;
				settings=jiro.model.actionAppendSettings.call($this,response);
			}
			action.breakPoint=breakPoint;
			if(func.hasOwnProperty('toggle')){
				action.overFunction=func.toggle;
				action.underFunction=func.toggle;
			}else{
				action.overFunction=func.over;
				action.underFunction=func.under;
			}
			jiro.model.actionAppend.call(this,action,settings);
		},
		addCont:function(func,options){
			var under,over,settings,$this=this;
			over=0;
			options=(options===undefined)?{}:options;
			settings=jiro.model.actionAppendSettings.call($this,options);
			func=jiro.common.addThis($this,func);
			function toggle(state){
				return function(){
					settings.capture[state](settings.event+'.jiro',func);
					if(!this.waitingForInit){
						func();//split this into a seperate function to make this more accurate
					}
				};
			}
			if(options.hasOwnProperty('under')){
				under=options.under;
				jiro.model.actionAppend.call($this,{breakPoint:under,overFunction:toggle('off'),underFunction:toggle('on')},settings);
			}
			if(options.hasOwnProperty('over')){
				over=options.over;
				jiro.model.actionAppend.call($this,{breakPoint:over,overFunction:toggle('on'),underFunction:toggle('off')},settings);
			}else if(under===undefined){
				toggle('on')();
			}
			$(document).ready(function(){
				var propValue=settings.propFunc();
				if((propValue>=over)&&((propValue<=under)||(under===undefined))){
					func();
				}
			});
		},
		addStep:function(property,values){
			var settings,array,limit,actions,current,$this=this;
			settings=jiro.model.actionAppendSettings.call($this,values);
			array={};
			actions=[];
			if(!(property.hasOwnProperty('getter'))){
				if(property.hasOwnProperty('css')){
					property.getter=function(){return $(property.elem).css(property.css);};
				}else if(property.hasOwnProperty('prop')){
					property.getter=function(){return $(property.elem)[property.prop]();};
				}
			}
			if(!(property.hasOwnProperty('setter'))){
				if(property.hasOwnProperty('css')){
					property.setter=function(val){return $(property.elem).css(property.css,val);};
				}else if(property.hasOwnProperty('prop')){
					property.setter=function(val){return $(property.elem)[property.prop](val);};
				}
			}
			current=property.getter();
			function append(bp,overValue,underValue){
				actions.push({
					breakPoint:bp,
					overFunction:function(){return property.setter((overValue==='current')?current:overValue);},
					underFunction:function(){return property.setter((underValue==='current')?current:underValue);}
				});
			}
			function toActions(arr,underVal,j){
				var i,overVal;
				for(i=0;(i+j)<arr.length;i++){
					overVal=arr[i+j].value;
					append(arr[i].key,overVal,underVal);
					underVal=overVal;
				}
			}
			if(values.hasOwnProperty('over')){
				array.over=jiro.common.objectToArray(values.over);
				limit=(values.over.hasOwnProperty('limit'))?values.over.limit:'current';
				toActions(array.over,limit,0);
			}
			if(values.hasOwnProperty('under')){
				array.under=jiro.common.objectToArray(values.under);
				toActions(array.under,array.under[0].value,1);
				limit=(values.under.hasOwnProperty('limit'))?values.under.limit:'current';
				append(array.under[array.under.length-1].key,limit,array.under[array.under.length-1].value);
			}
			jiro.model.actionAppend.call($this,actions,settings);
		},
		css:function(prop){
			var $this=this;
			if(typeof prop==='object'){
				jiro.css.object.call($this,prop);
			}else if(typeof prop==='string'){
				jiro.css.string.apply($this,arguments);
			}else{
				console.log('Incorrect argument type for jQuery.jiro.css');
			}
		},
		cssRestore:function(){
			var $this=this;
			try{
				$this.css($this.data('jiro').css);
			}catch(e){
				console.log('jQuery.jiro: "cssRestore" unsuccessful, no data to restore to');
			}
		}
	};
	$.fn.jiro=function(method){
		var $this=this;
		if(jiro.user[method]){
			jiro.user[method].apply($this,Array.prototype.slice.call(arguments,1));
			$(function(){
				$this.trigger('init.jiro');
			});
		}else{
			console.log('Method "'+method+'" does not exist in jQuery.jiro');
		}	
		return $this;
	};
	$.fn.jiro.custom={};
})(jQuery);