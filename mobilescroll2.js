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
	@update: 2014/5/14

---------------------------------------*/
	var
	m_start=supportTouch?'touchstart':'mousedown',
	m_move=supportTouch?'touchmove':'mousemove',
	m_end=supportTouch?'touchend':'mouseup',
	getEventY=function (e){//获取动作当前坐标
		var coors = 0;
		if (e.changedTouches){ //iPhone
			coors = e.changedTouches[0].clientY;
		}else {
			coors = e.clientY;
		}
		return coors;
	},checkBouce=function(el,deltaY){
		var st=el.scrollTop,jam=el.mscrollJam,createJam=function(){
			if(!(jam=el.mscrollJam)){
				el.mscrollJam=jam=document.createElement('div');
				jam.style.width="100%";
				jam.style.height=0;
			}
			
			return jam;
		},
        boucing=function(dy){
            var jamHeight=dy/3;
           // console.log('jamHeight',jamHeight,dy)
            if(jamHeight>0){
                jam.style.height=Math.min(jamHeight,100)+'px';
            }else{

				removeBounce(el);

            }

        },
	    deltaY=deltaY||0;
//console.log(deltaY,st+deltaY)
		if(st+deltaY<=0){
			
			el.insertBefore(createJam(),el.firstChild);

            boucing(-deltaY);

		}else if(st+deltaY>=el.scrollHeight-el.clientHeight){
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
        if(jam&&!jam._transitioning){
            
			// console.log(12,typeof jam.style.transitionDuration,typeof jam.style.webkitTransitionDuration);
			// el.mscrollJam=null;
            jam._transitioning=true;
			 var needWebkit=('webkitTransition' in jam.style),
				 key=needWebkit?'webkitTransition':'transition';
                
				jam.style[key]='height .2s';
				jam.style.height=0;
				jam.addEventListener(needWebkit?'webkitTransitionEnd':'transitionend',function(e){
					//console.log('webkitTransitionEnd',e.type,jam,'removing')
					jam.parentNode.removeChild(jam);
					el.mscrollJam=null;
                    jam._transitioning=undefined;
				},false);
			
            
        }

    },_fire=function(eventName,data){
            var el=this;
            if(typeof el['on'+eventName]=='function'){
                data=data||{};
                data.type=eventName;
                el['on'+eventName].call(el,data);
            }
    };
	
	HTMLElement.prototype.touchScroll=function(){
			var isstart=false,startY,startTime,self=this,speed;
			self.addEventListener(m_start,function(e){
				if(typeof self.scrollStop=="function"){self.scrollStop();}
				
				startY=getEventY(e);
				//console.log('---------- startY:'+startY);
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
					var newY=getEventY(e),
					distance=startY-newY,
					time=new Date().getTime()-startTime;
//console.log('newY:'+newY+'time:'+time);
					if(checkBouce(self,distance)){
                        _fire.call(self,'MScrollBounce',{
                            scrollTop:self.scrollTop,
                            deltaY:distance
                        });
                       return;
                    }//console.log('ye',distance)
					self.scrollTop+=(distance);//console.log('ye',distance,self.scrollTop)

                    _fire.call(self,'MScrolling',{
                        scrollTop:self.scrollTop,
                        deltaY:distance
                    });
					speed=distance/time;
					startY=newY;
					startTime=new Date().getTime();

				}
			},false);
	};

	/*
		以一定的速度滚动一段距离，在某个减速度的影响下
		参数：
		speed -- 初速度(ms)
	*/
	
	HTMLElement.prototype.speedTo=function(speed){
		var criticalSpeed=0.06;//可以引发滚动的临界速度
		//过滤速度，不能大于5px/ms
		speed=Math.max(-5,Math.min(5,speed))
		//	log(speed)
		if(speed&&Math.abs(speed)>criticalSpeed){
			var 
			self=this,
			a=1/500,//减速度
			reverse=speed<0,//是否反向(向上为正)
			a=reverse?-a:a,
			oriSpeed=speed,//初速度
			t=16,//两帧之间的时间间隔(ms)
			
			ori=self.scrollTop,
			d=speed*t,
			iv=setInterval(function(){
				speed-=t*a
				d+=(speed*t);
				var lastScroll=self.scrollTop;//改变之前的值，如改变之后这个值不变，说明滚动到底了，该停止
                checkBouce(self,d)
				self.scrollTop=d+ori;

                _fire.call(self,'MScrolling',{
                    scrollTop:self.scrollTop,
                    deltaY:d
                });
				if(oriSpeed*speed<=0||lastScroll==self.scrollTop){
					//clearInterval(iv);
                    if(self.scrollStop)self.scrollStop.call(self)
				}
			},t);
			self.scrollTop=d+ori;
			self.scrollStop=function(){
				clearInterval(iv);
                removeBounce(self)
			}
		}
	};
})('ontouchend' in document);
/***************************** package end ***************************************/