/********************************** package begin ********************************************/
(function(supportTouch){
/*----------------------------------------

	mobile scroll 
	@author:wur
	@date:2011.4.28
	@update:
		2011.4.29 
				speedTo方法中加了个可以滚动的临界速度判断
				增加了滚动到停止的判断（滚不动了）
		2011.7.27
			改名为touchScroll
			在手机端去掉e.preventDefault()，让内部元素可点击
		
	@last update date:2011.7.27
	@update: 2014/5/14 增加bounce 效果，合并PC和mobile代码

---------------------------------------*/
	var
	m_start=supportTouch?'touchstart':'mousedown',
	m_move=supportTouch?'touchmove':'mousemove',
	m_end=supportTouch?'touchend':'mouseup',
	defaultConfig={
		criticalSpeed:0.06,
		a:1/500,
		delay:16
	},
	getClient=function (e){//获取动作当前坐标
		var coors = {};
		if (e.changedTouches){ 
			coors = {
				x:e.changedTouches[0].clientX,
				y:e.changedTouches[0].clientY
			}
		}else {
			coors = {
				x:e.clientX,
				y:e.clientY
			}
		}
		return coors;
	},checkBouce=function(el,deltaY,inertia){
		var st=el.scrollTop,jam=el.mscrollJam,createJam=function(){
			if(!(jam=el.mscrollJam)){
				el.mscrollJam=jam=document.createElement('div');
				jam.style.width="100%";
				jam.style.height=0;
			}
			
			return jam;
		},
		
        boucing=function(dy){
            var jamHeight=dy/3,lastHeight=jam.clientHeight;
			//console.log('boucing',inertia,lastHeight,jam.style.height,jamHeight)
			if(jamHeight<=0||inertia&&(Math.abs(lastHeight-jamHeight)<1||jamHeight>=50)){
				//惯性条件下，最高只为行程一半
				removeBounce(el);
			}else{
				jam.style.height=Math.min(jamHeight,100)+'px';
				_fire.call(el,'MScrollBounce',{
					scrollTop:self.scrollTop,
					scrollLeft:self.scrollLeft,
					deltaY:jamHeight,
					deltaX:0
				});
			}
			

        },
	    deltaY=deltaY||0;
//console.log(deltaY,st+deltaY,el.scrollHeight-el.clientHeight)
		if(st+deltaY<=0){
			//console.log('up bounce',st,deltaY)
			el.insertBefore(createJam(),el.firstChild);

            boucing(-deltaY);

		}else if(st+deltaY>=el.scrollHeight-el.clientHeight){//console.log('up bounce')
           //console.log('append',st+deltaY,el.scrollHeight,el.clientHeight)
			el.appendChild(createJam());
            el.scrollTop=st+deltaY;
                boucing(deltaY);

		}else if(jam){

			el.removeChild(jam);
			el.mscrollJam=null;

		}//console.log('mjam',el.mscrollJam);
		return el.mscrollJam;

    },
    removeBounce=function(el){
        var jam=el.mscrollJam;
        if(jam&&!jam._removing){
            //el.MScrollStatus='end';
			// console.log(12,typeof jam.style.transitionDuration,typeof jam.style.webkitTransitionDuration);
			// el.mscrollJam=null;
            jam._removing=true;
			 var needWebkit=('webkitTransition' in jam.style),
				 key=needWebkit?'webkitTransition':'transition';
                
				jam.style[key]='height .2s';
				jam.style.height=0;
				jam.addEventListener(needWebkit?'webkitTransitionEnd':'transitionend',function(e){
				//	console.log('webkitTransitionEnd',e.type,jam,'removing')
					jam.parentNode.removeChild(jam);
					el.mscrollJam=null;
                    jam._removing=undefined;
				},false);
			
            
        }

    },bouceOnce=function(deltaY){
		
	},
	_fire=function(eventName,data){
            var el=this;
            if(typeof el['on'+eventName]=='function'){
                data=data||{};
                data.type=eventName;
                el['on'+eventName].call(el,data);
            }
    };
	
	HTMLElement.prototype.touchScroll=function(){
			var isstart=false,startPos={},startTime,self=this,speed;
			self.addEventListener(m_start,function(e){
				if(typeof self.scrollStop=="function"){self.scrollStop();}
				
				startPos=getClient(e);
				
				startTime=new Date().getTime();
				isstart=true;
				speed=0;
				//e.preventDefault();
			},false);

			document.addEventListener(m_end,function(e){
				if(isstart){
					isstart=false;
					self.speedTo(speed);
					e.preventDefault();
                    removeBounce(self)
				}
			},false);

			document.addEventListener(m_move,function(e){
				if(isstart){
                    e.preventDefault();
					var newPos=getClient(e),
					distanceY=startPos.y-newPos.y,
					distanceX=startPos.x-newPos.x,
					time=new Date().getTime()-startTime;
					
//console.log('newY:'+newY+'time:'+time);
					if(Math.abs(distanceX)-Math.abs(distanceY)>0){
						//deltaY > deltaX，就认为是y方向划动
						//目前先实现Y方向的
						//todo: X方向实现
						//log('x='+distanceX+'  y='+distanceY);
						startTime=new Date().getTime();
						startPos=newPos;
						return;
					}
					
					if(checkBouce(self,distanceY)){
                        
                       return;
                    }
					self.scrollTop+=(distanceY);//console.log('ye',distance,self.scrollTop)
                    _fire.call(self,'MScrolling',{
                        scrollTop:self.scrollTop,
						scrollLeft:self.scrollLeft,
                        deltaY:distanceY,
						deltaX:distanceX
                    });
					speed=distanceY/time;
					startTime=new Date().getTime();
					startPos=newPos;
				}
			},false);
	};

	/*
		以一定的速度滚动一段距离，在某个减速度的影响下
		参数：
		speed -- 初速度(ms)
	*/
	
	HTMLElement.prototype.speedTo=function(speed){
		var criticalSpeed=defaultConfig.criticalSpeed,//可以引发滚动的临界速度
		self=this,
		a=defaultConfig.a,//减速度
		reverse=speed<0,//是否反向(向上为正)
		a=reverse?-a:a,
		oriSpeed=speed,//初速度
		t=defaultConfig.delay,//两帧之间的时间间隔(ms)
		//过滤速度，不能大于5px/ms
		speed=Math.max(-3,Math.min(3,speed)),//s=speed*spend/a/2 保证最大划动距离为2250px
		distance=Math.pow(speed,2)/a/2;
			//console.log('speed&distance:',speed,distance)
		if(speed&&Math.abs(speed)>criticalSpeed){
			var 
		
			ori=self.scrollTop,
			d=speed*t,
			bouncing,
			iv=setInterval(function(){
				speed-=t*a;
				d+=(speed*t);
				var lastScroll=self.scrollTop;//改变之前的值，如改变之后这个值不变，说明滚动到底了，该停止
                
				self.scrollTop=d+ori;
				if(!bouncing){
					_fire.call(self,'MScrolling',{
						scrollTop:self.scrollTop,
						deltaY:d
					});
				}
				if(oriSpeed*speed<=0){//speed 方向发生变化
					//clearInterval(iv);
					//console.log('end',d)
                    if(self.scrollStop)self.scrollStop.call(self)
				}else if(lastScroll==self.scrollTop){//还有速度，但scroll 上下都不能滚动了或delta 太小导致不了变化 
					//if(lastScroll==self.scrollTop){
						
					if((bouncing=checkBouce(self,d+ori-lastScroll,true))&&bouncing._removing){
					//	console.log('bbbbonn',bouncing,bouncing._removing)	
						if(self.scrollStop)self.scrollStop.call(self)
					}
					

				}
			},t);
			self.scrollTop=d+ori;
			self.scrollStop=function(){//console.log('stop')
				clearInterval(iv);
                removeBounce(self);
				_fire.call(self,'MScrollStop');
			}
		}
	};
})('ontouchend' in document);
/***************************** package end ***************************************/