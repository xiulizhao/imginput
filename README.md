# imginput
获取本地图片元素,并输出图片的src. 在需要上传并预览本地图片时可使用<br>
普通属性<br>
data-enable	压缩上传图片，需要设置宽或高像素	默认:不开启 true/false/cutdown(精压缩比开启获取的base64图还要小)<br>
data-towidth	重设上传图片宽度，不用填写单位（默认px）,(宽度/高度必填一项，填写一项，按正常图片宽高比）	300<br>
data-maxwidth	设置图片宽度，不用填写单位（默认px）,该选项和data-enable="cutdown"开启精压缩配合使用，必填项）	500<br>
data-toheight	重设上传图片高度	200<br>
data-canvasid	设置canvas标签的id，当一个页面使用多个此元素时使用，设置不同id即可(页面id与此id对应)	<br>
data-quality	设置上传图片速度/质量比，数字越大，图片质量越高，3最大，0最小	影响较小，主要重设宽/高<br>
data-alpha	是否使用阿尔法通道，一般默认即可	<br>
输出属性<br>
data-x-imgsrc	用户所选择的图片的src. 将其放入img元素的src即可显示该图片	默认 关<br>
