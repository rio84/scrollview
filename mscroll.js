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
	},
	MScroll=function(el){
		bindToElement.call(el);
	},
	/*
		以一定的速度滚动一段距离，在某个减速度的影响下
		参数：
		speed -- 初速度(ms)
	*/
	
	speedTo=function(el,speed){//log(speed)
		var criticalSpeed=0.06;//可以引发滚动的临界速度
		if(speed&&Math.abs(speed)>criticalSpeed){
			var 
			self=el,
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
				self.scrollTop=d+ori;
				if(typeof self.onMScroll=='function'){
					self.onMScroll({scrollTop:self.scrollTop});
				}
				if(oriSpeed*speed<=0||lastScroll==self.scrollTop){
					clearInterval(iv);
				}
			},t);
			self.scrollTop=d+ori;
			self.scrollStop=function(){
				clearInterval(iv);
			}
		}
	},
	bindToElement=function(){
		var isstart=false,startY,startTime,self=this,speed;
		self.addEventListener(m_start,function(e){
			if(typeof self.scrollStop=="function"){self.scrollStop();}
			
			startY=getEventY(e);
			//log('---------- startY:'+startY);
			startTime=new Date().getTime();
			isstart=true;
			speed=0;
			//e.preventDefault();
		},false);

		document.addEventListener(m_end,function(e){
			if(isstart){
				isstart=false;
				speedTo(self,speed);
				e.preventDefault();
			}
		},false);

		document.addEventListener(m_move,function(e){
			if(isstart){
				var newY=getEventY(e),
				distance=startY-newY,
				time=new Date().getTime()-startTime;
///log('newY:'+newY+'time:'+time);
				self.scrollTop+=(distance);
				if(typeof self.onMScroll=='function'){
					self.onMScroll({scrollTop:self.scrollTop});
				}
				speed=distance/time;
				startY=newY;
				startTime=new Date().getTime();
				e.preventDefault();
			}
		},false);
	};

	

	window.MScroll=MScroll;
})('ontouchend' in document);
/***************************** package end ***************************************/