#scrollView
----
* author: rio84@qq.com
* version:1.0.1

 --------


## Updates
### 2014/6/10 21:25
* disable tap when scrolling
* fix _fire el is undefined


## Getting started
* Active an customElement with tagName 'scrollview' and 'bounce'. It's developed for mobile webview or browser. It behaiver the same as overflow:auto in PC browser.
* All members of the scrollview element inherit from HTMLElement.
* descide the direction to scroll according to css overflow settings. eg:

    	scrollview{
    		overflow-x:hidden;/*  */
    		overflow-y:auto;/* scroll direction is y */
    	}
* 'bounce' element usage:

		<scrollview id="scollview">
			<bounce>
				<!-- bounce content -->
				<span>head bounce content~~</span>
			</bounce>
			<content>
				<!--
					your content here 
				-->
			</content>
			<bounce>			
				<span>no more~~</span>
			</bounce>
		</scrollview>




## Methods:

### scrollTo(x,y)
* x - [Number] scrollLeft value
* y - [Number] scrollTop value
* return this

### speedTo(speed,direction,bounce)
* speed - [Number] px/ms
* direction - [String] 'x' or 'y', default:y
* bounce - [Boolean]



## Events:
you can use both:

	el.addEventListener('scroll',function(){},false)
and 

	el.onscroll=function(){}
### scroll
* dispatch when scrolling

### scrollstop
* dispatch when scroll is end

### scrollbounce
* dispatch when scroll is bouncing

### scrollbouncestop
* dispatch when bouce is end





