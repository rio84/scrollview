
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
            instanceConfig={
                direction:'y'//or x,xy

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
            },checkBouce=function(el,delta,type,inertia){
                var jam=el.mscrollJam,
                    isY=type!=='x',
                    st=isY?el.scrollTop:el.scrollLeft,
                    sname=isY?'Height':'Width',
                    createJam=function(type){
                        if(!(jam=el.mscrollJam)){
                            el.mscrollJam=jam=document.createElement('div');
                            if(isY){
                                jam.style.width="100%";
                                jam.style.height=0;
                            }else{
                                jam.style.width=0;
                                jam.style.height="100%";
                            }
                            jam.setAttribute('data-type',isY?'y':'x')
                            jam.className='__mscroll__jam';
                        }

                        return jam;
                    },

                    boucing=function(d){
                        var jamDelta=d/3,lastDelta=jam['client'+sname],maxBounce=isY?100:20;
                        if(inertia){//console.log('max?',lastDelta,jamDelta)
                            jamDelta=Math.max(jamDelta,lastDelta);
                        }
                        //console.log('boucing',inertia,lastHeight,jam.style.height,jamHeight)
                        if(jamDelta<=0||inertia&&(Math.abs(lastDelta-jamDelta)<1||jamDelta>=maxBounce/2)){
                            //惯性条件下，最高只为行程一半
                            removeBounce(el);
                        }else{
                            jam.style[sname.toLowerCase()]=Math.min(jamDelta,maxBounce)+'px';
                            _fire.call(el,'MScrollBounce',{
                                scrollTop:self.scrollTop,
                                scrollLeft:self.scrollLeft,
                                deltaY:isY?jamDelta:0,
                                deltaX:isY?0:jamDelta
                            });
                        }


                    },
                    delta=delta||0;
//console.log(deltaY,st+deltaY,el.scrollHeight-el.clientHeight)
                if(st+delta<=0){
                    //console.log('up bounce',st,deltaY)
                   el.insertBefore(createJam(),el.firstChild);
                  //  createJam(isY?'top':'left')

                    boucing(-delta);

                }else if(st+delta>=el['scroll'+sname]-el['client'+sname]){//console.log('up bounce')
                   // //log('append',deltaY,st,el.scrollHeight,el.clientHeight)
                    el.appendChild(createJam());
                   // createJam(isY?'bottom':'right')
                   if(isY) el.scrollTop=st+delta;
                    else el.scrollLeft=st+delta;
                    boucing(delta);

                }else if(jam){
                   // //log('removechild')
                    el.removeChild(jam);
                    el.mscrollJam=null;

                }//console.log('mjam',el.mscrollJam);
                return el.mscrollJam;

            },
            removeBounce=function(el){////log('removing')
                var jam=el.mscrollJam;
                if(jam&&!jam._removing){//log('removing start')
                    //el.MScrollStatus='end';
                    // console.log(12,typeof jam.style.transitionDuration,typeof jam.style.webkitTransitionDuration);
                    // el.mscrollJam=null;
                    jam._removing=true;
                    var needWebkit=('webkitTransition' in jam.style),
                        key=needWebkit?'webkitTransition':'transition',
                        sname=jam.getAttribute('data-type')=='x'?'width':'height';

                    jam.style[key]=sname+' .2s';
                    jam.style[sname]=0;
                    //log('removing adde'+needWebkit)
                    jam.addEventListener(needWebkit?'webkitTransitionEnd':'transitionend',function(e){
                        //	console.log('webkitTransitionEnd',e.type,jam,'removing')
                        //log('removing cb')
                        jam.parentNode.removeChild(jam);
                        el.mscrollJam=null;
                        jam._removing=undefined;
                        _fire.call(el,'MScrollBounceEnd',{
                            scrollTop:el.scrollTop,
                            scrollLeft:el.scrollLeft
                        });
                        //log('removing end')
                    },false);


                }

            },
            _fire=function(eventName,data){
                var el=this;
                if(typeof el['on'+eventName]=='function'){
                    data=data||{};
                    data.type=eventName;
                    el['on'+eventName].call(el,data);
                }
            };

        HTMLElement.prototype.touchScroll=function(config){
            var isstart=false,startPos={},startTime,self=this,speed,config=config||{},
                isY;

            for(var k in instanceConfig){

                if(!(k in config)){
                    config[k]=instanceConfig[k];
                }
            }
            isY=config.direction!=='x';


            self.__mscroll_config=config;
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
                    self.speedTo(speed,config.direction);
                    e.preventDefault();
                   // removeBounce(self)
                }
            },false);

            document.addEventListener(m_move,function(e){
                if(isstart){
                    e.preventDefault();
                    var newPos=getClient(e),
                        distanceY=startPos.y-newPos.y,
                        distanceX=startPos.x-newPos.x,
                        time=new Date().getTime()-startTime,
                        directionDelta=Math.abs(distanceX)-Math.abs(distanceY);

//console.log('newY:'+newY+'time:'+time);
                    if(directionDelta>0){
                        //deltaY > deltaX，就认为是y方向划动
                        //目前先实现Y方向的

                        //log('x='+distanceX+'  y='+distanceY);
                        if(config.direction=='y'){
                            startTime=new Date().getTime();
                            startPos=newPos;
                            return;
                        }

                    }else if(directionDelta<0){
                        if(config.direction=='x'){
                            startTime=new Date().getTime();
                            startPos=newPos;
                            return;
                        }
                    }

                    if(checkBouce(self,isY?distanceY:distanceX,isY?'y':'x')){

                        return;
                    }
                    if(isY){
                        self.scrollTop+=(distanceY);
                        speed=distanceY/time;
                    }else{
                        self.scrollLeft+=(distanceX);//console.log('ye',distance,self.scrollTop)
                        speed=distanceX/time;
                    }
                    _fire.call(self,'MScrolling',{
                        scrollTop:self.scrollTop,
                        scrollLeft:self.scrollLeft,
                        deltaY:distanceY,
                        deltaX:distanceX
                    });

                    startTime=new Date().getTime();
                    startPos=newPos;
                }
            },false);
            return this;
        };

        /*
         以一定的速度滚动一段距离，在某个减速度的影响下
         参数：
         speed -- 初速度(ms)
         */

        HTMLElement.prototype.speedTo=function(speed,direction){//console.log('direction',direction)
            var criticalSpeed=defaultConfig.criticalSpeed,//可以引发滚动的临界速度
                self=this,
                isY=direction!=='x',

                scName=isY?'scrollTop':'scrollLeft',
                a=defaultConfig.a,//减速度
                reverse=speed<0,//是否反向(向上为正)
                a=reverse?-a:a,
                oriSpeed=speed,//初速度
                t=defaultConfig.delay,//两帧之间的时间间隔(ms)
            //过滤速度，不能大于5px/ms
                speed=Math.max(-3,Math.min(3,speed)),//s=speed*spend/a/2 保证最大划动距离为2250px
                distance=Math.pow(speed,2)/a/ 2;

            self.scrollStop=function(){
                iv&&clearInterval(iv);
                removeBounce(self);
                _fire.call(self,'MScrollStop');
                self.scrollStop=null;
            }
            if(speed&&Math.abs(speed)>criticalSpeed){
                var

                    ori=self[scName],
                    d=speed*t,
                    bouncing,
                    iv=setInterval(function(){
                        speed-=t*a;
                        d+=(speed*t);
                        var lastScroll=self[scName];//改变之前的值，如改变之后这个值不变，说明滚动到底了，该停止

                        self[scName]=d+ori;
                        if(!bouncing){
                            _fire.call(self,'MScrolling',{
                                scrollTop:self.scrollTop,
                                scrollLeft:self.scrollLeft,
                                deltaY:isY?d:0,
                                deltaX:isY?0:d
                            });
                        }
                        if(oriSpeed*speed<=0){//speed 方向发生变化
                            //clearInterval(iv);
                            //console.log('end',d)
                            if(self.scrollStop)self.scrollStop.call(self)
                        }else if(lastScroll==self[scName]){//还有速度，但scroll 上下都不能滚动了或delta 太小导致不了变化
                            //if(lastScroll==self.scrollTop){

                            if((bouncing=checkBouce(self,d+ori-lastScroll,direction,true))&&bouncing._removing){
                                //	console.log('bbbbonn',bouncing,bouncing._removing)
                                if(self.scrollStop)self.scrollStop.call(self)
                            }


                        }
                    },t);
                self[scName]=d+ori;

            }else{
                self.scrollStop&&self.scrollStop.call(self,{})
            }
            return this;
        };
        HTMLElement.prototype.scrollTo=function(x,y){
            (x!==undefined)&&(this.scrollLeft=x);
            (y!==undefined)&&(this.scrollTop=y);
            return this;

        };
    })('ontouchend' in document);
    /***************************** package end ***************************************/
