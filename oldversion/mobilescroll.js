/********************************** package begin ********************************************/
(function(){
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

---------------------------------------*/
	//获取动作当前坐标
	function getClient(e){
		var coors = 0;
		if (e.changedTouches){ //iPhone
			coors = e.changedTouches[0].clientY;
		}else {
			coors = e.clientY;
		}
		return coors;
	}

	HTMLElement.prototype.touchScroll=function(){
			var isstart=false,startY,startTime,self=this,speed;

			self.addEventListener("touchstart",function(e){
				if(typeof self.scrollStop=="function"){self.scrollStop();}
				startY=getClient(e);
				startTime=new Date().getTime();
				isstart=true;
				speed=0;
				//e.preventDefault();
			},false);

			document.addEventListener("touchend",function(e){
				if(isstart){
					isstart=false;
					self.speedTo(speed);
					e.preventDefault();
				}
			},false);

			document.addEventListener("touchmove",function(e){
				if(isstart){
					var newY=getClient(e),
					distance=startY-newY,
					time=new Date().getTime()-startTime;

					self.scrollTop+=(distance);
					speed=distance/time;
					startY=newY;
					startTime=new Date().getTime();
					e.preventDefault();
				}
			},false);

		if(navigator.userAgent.indexOf("Windows")>-1){
			self.addEventListener("mousedown",function(e){
				if(typeof self.scrollStop=="function"){self.scrollStop();}
				startY=getClient(e);
				startTime=new Date().getTime();
				isstart=true;
				speed=0;
				e.preventDefault();
			},false);

			document.addEventListener("mouseup",function(e){
				if(isstart){
					isstart=false;
					self.speedTo(speed);
					e.preventDefault();
				}
			},false);

			document.addEventListener("mousemove",function(e){

				if(isstart){
					var newY=getClient(e),
					distance=startY-newY,
					time=new Date().getTime()-startTime;

					self.scrollTop+=(distance);
					speed=distance/time;
					startY=newY;
					startTime=new Date().getTime();
					e.preventDefault();
				}

			},false);
		}

	};

	/*
		以一定的速度滚动一段距离，在某个减速度的影响下
		参数：
		speed -- 初速度(ms)
	*/
	
	HTMLElement.prototype.speedTo=function(speed){
		var criticalSpeed=0.2;//可以引发滚动的临界速度
		if(speed&&Math.abs(speed)>criticalSpeed){
			var 
			self=this,
			a=1/200,//减速度
			reverse=speed<0,//是否反向(向上为正)
			a=reverse?-a:a,
			oriSpeed=speed,//初速度
			t=50,//两帧之间的时间间隔(ms)
			
			ori=self.scrollTop,
			d=speed*t,
			iv=setInterval(function(){
				speed-=t*a
				d+=(speed*t);
				var lastScroll=self.scrollTop;//改变之前的值，如改变之后这个值不变，说明滚动到底了，该停止
				self.scrollTop=d+ori;
				if(oriSpeed*speed<=0||lastScroll==self.scrollTop){
					clearInterval(iv);
				}
			},t);
			self.scrollTop=d+ori;
			self.scrollStop=function(){
				clearInterval(iv);
			}
		}
	};
})();
/***************************** package end ***************************************/