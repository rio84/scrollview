#scrollView
----
* author: rio84@qq.com
* version:1.0.0

 --------

## 说明
* Active an customElement with tagName 'scrollview' and 'bounce'. It's developed for mobile webview or browser. It behaiver the same as overflow:auto in PC browser.
* All members of the scrollview element inherit from HTMLElement.
* descide the direction to scroll according to css overflow settings. eg:

    	scrollview{
    		overflow-x:hidden;/** pay attention */
    		overflow-y:auto;/** pay attention; */
    	}
* 'bounce' element usage:

		<scrollview id="scollview">
			<bounce>
				<span>head bounce content~~</span><!-- bounce content -->
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



## methods

### scrollTo(x,y)

### speedTo(speed,direction,bounce)



## demo
* index.html

