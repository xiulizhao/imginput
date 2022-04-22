(function (root, factory) {
    /* CommonJS */
    if (typeof exports == "object") module.exports = factory();
    /* AMD module */
    else if (typeof define == "function" && define.amd) define(factory);

    /*第一处修改，将wwtemplate改为元素名(data-wwclass的值)*/
    else root.imginput = factory();
}(this, function () {
    "use strict";

    /*第二处修改，将wwtemplate改为元素名(data-wwclass的值)*/
    var wwclassName = /*INSBEGIN:WWCLSNAME*/
        "imginput"
        /*INSEND:WWCLSNAME*/
        ;

    //默认没有依赖资源
    // function loadDependence(fncallback) {
    //   if (typeof fncallback === "function") {
    //     fncallback();
    //   }
    // }

    // 加载依赖资源, 如没有依赖资源可直接回调
    var loadDependence = function (fncallback) {
        // 这里依赖具体的依赖对象，由于可能从其它元素中被加载，因此名称需要使用依赖库的名称，并需要settimeout来等待。
        // 本模板只支持一个依赖库，如果需要多个依赖库，需要改进。
        if (!window.wwload.imginput) {
            window.wwload.imginput = "wait";
            requirejs.config({
                paths: {
                    "imginput": "libs/pica/dist/pica.min"
                },
                "shim": {
                    "imginput": {
                        deps: ["jquery"]
                    }
                }
            });
            require(["imginput"], function (pica) {
                window.wwload.imginput = true;
                window.pica = pica;
                replace();
                fncallback();
            });
        } else if (window.wwload.imginput === "wait") {
            setTimeout(function () {
                loadDependence(fncallback);
            }, 100);
        } else {
            replace();
            fncallback();
        }

        function replace() {
            loadDependence = function (fncallback) {
                fncallback();
            };
        }
    };
    //


    // 本函数处理元素初始化动作
    var init = function () {
        init = function () {
            return true;
        };

        $.wwclass.addEvtinHandler(wwclassName, evtInHandler);

        // 如有其他初始化动作, 请继续在下方添加
    };

    function isWeiXin() {
        var ua = window.navigator.userAgent.toLowerCase();
        // console.log(ua);//mozilla/5.0 (iphone; cpu iphone os 9_1 like mac os x) applewebkit/601.1.46 (khtml, like gecko)version/9.0 mobile/13b143 safari/601.1
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    }
    // 元素初始化——每个wwclass元素只会被初始化一次。, 传入了元素对象($前缀表明是一个jquery对象).

    function processElement($ele) {
        // 对 $ele 元素做对应处理
        // 判断是否移动或PC
        // try {
        var browser = {
            versions: function () {
                var u = navigator.userAgent,
                    app = navigator.appVersion;
                //    console.log(' u:--------' +u);
                // console.log('App:--------' + app);
                return { //移动终端浏览器版本信息  
                    webApp: u.indexOf('Crosswalk') > -1 //是否自己打包的web应该程序
                };
            }()
        };
        var resizer;
        var resizer_mode = {
            js: true,
            wasm: true,
            cib: true,
            ww: true
        };

        function create_resizer() {
            var opts = [];
            Object.keys(resizer_mode).forEach(function (k) {
                if (resizer_mode[k]) opts.push(k);
            });
            resizer = window.pica({ features: opts });
        };


        function scucessSelector(inputfiles) {
            var reader = new FileReader();
            var imgsrc;
            reader.onload = function (e) {
                var towidth = parseInt($ele.attr("data-towidth") || "500");
                var toheight = parseInt($ele.attr("data-toheight"));
                var maxwidth = parseInt($ele.attr("data-maxwidth"));
                var quality = parseInt($ele.attr("data-quality"));
                if ($ele.attr("data-enable") === "true") {
                    create_resizer();
                    var img = new Image();
                    img.src = e.target.result;
                    var dst, width, height;
                    width = towidth;
                    height = toheight;
                    if (!(towidth || toheight)) {
                        width = img.width;
                        console.log('您并未设置重设图片的宽/高，图片尺寸压缩很小，请设置图片宽/高其中一项');
                    }
                    img.onload = function () {
                        dst = $($ele.attr("data-canvasid") || "#dst-pica")[0];
                        dst.width = width || (img.width * height / img.height);
                        dst.height = height || (img.height * width / img.width);
                        var offScreenCanvas = document.createElement('canvas');
                        offScreenCanvas.width = dst.width;
                        offScreenCanvas.height = dst.height;
                        resizer.resize(img, offScreenCanvas, {
                            quality: quality,
                            transferable: true
                        }).then(function () {
                            // dst.getContext('2d').drawImage(offScreenCanvas, 0,0);
                            var resizeimage = offScreenCanvas.toDataURL("image/jpeg");

                            // console.log("旧压缩" + resizeimage);
                            // console.log(resizeimage.length / 1024);
                            $.wwclass.helper.updateProp($ele, "data-x-imgsrc", resizeimage);
                            // console.log(imgDate);//输出base64格式图片

                            // imgsrc = resizeimage;
                            var input = e.currentTarget;
                            // input.value = '';
                            // 延后执行, 以便让data-x的同步先进行处理
                            // setTimeout(function () {
                            $.wwclass.helper.anijsTrigger($ele, "getimg");
                            //}, 0);
                        });
                    };


                } else if ($ele.attr("data-enable") === "cutdown") {
                    var newImage = new Image();
                    var quality = 0.9;    //压缩系数0-1之间
                    newImage.src = e.target.result;
                    newImage.setAttribute("crossOrigin", 'Anonymous');  //url为外域时需要
                    var imgWidth, imgHeight;
                    newImage.onload = function () {
                        imgWidth = this.width;
                        imgHeight = this.height;
                        var canvas = document.createElement("canvas");
                        var ctx = canvas.getContext("2d");
                        if (Math.max(imgWidth, imgHeight) > maxwidth) {
                            if (imgWidth > imgHeight) {
                                canvas.width = maxwidth;
                                canvas.height = maxwidth * imgHeight / imgWidth;
                            } else {
                                canvas.height = maxwidth;
                                canvas.width = maxwidth * imgWidth / imgHeight;
                            }
                        } else {
                            canvas.width = imgWidth;
                            canvas.height = imgHeight;
                            quality = 0.9;
                        }
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
                        var base64 = canvas.toDataURL("image/jpeg", quality); //压缩语句
                        // // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
                        while (base64.length / 1024 > 150) {
                            quality -= 0.01;
                            base64 = canvas.toDataURL("image/jpeg", quality);
                        }
                        // // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
                        // while (base64.length / 1024 < 50) {
                        //     quality += 0.001;
                        //     base64 = canvas.toDataURL("image/jpeg", quality);
                        // }

                        $.wwclass.helper.updateProp($ele, "data-x-imgsrc", base64);
                        // console.log("新压缩" + base64);
                        // console.log(base64.length / 1024);
                        $.wwclass.helper.anijsTrigger($ele, "getimg");
                        //callback(base64);//必须通过回调函数返回，否则无法及时拿到该值
                    }
                } else {
                    // console.log('123');

                    $.wwclass.helper.updateProp($ele, "data-x-imgsrc", e.target.result);
                    // console.log("未压缩" + e.target.result);
                    // imgsrc = e.target.result;
                    var input = e.currentTarget;
                    input.value = '';
                    // 延后执行, 以便让data-x的同步先进行处理
                    setTimeout(function () {
                        $.wwclass.helper.anijsTrigger($ele, "getimg");
                    }, 0);
                }
            };
            reader.readAsDataURL(inputfiles);
            // console.log(imgsrc);
            // return imgsrc;
        }
        if (pageconfig.browser.versions.mobile) {
            // console.log('browser.versions.webApp:--------' + browser.versions.webApp);
            // console.log('browser.versions:--------' + browser.versions);
            if (browser.versions.webApp) {
                //console.log('xxxx');
                $.wwclass.callApp("device", { method: "deviceInfo" }, function (value) {
                    var version = value.version.slice(0, 3);
                    //var model1 = JSON.stringify(value);
                    var model = value.model;
                    // console.log(model);
                    // console.log(model1);
                    console.log('browser.版本:--------' + version);
                    var android = value.platform;
                    if (android == "Android" && version == 4.4) { //判断安卓+4.4版本
                        $ele.on("click", function (e) { //点击后
                            e.preventDefault();
                            e.stopPropagation();
                            $ele.data("value", "");
                            var photoFun = function () {
                                $.wwclass.callApp("camera", {
                                    method: "getPicture",
                                    cameraOptions: {
                                        quality: 50,
                                        mediaType: 0,
                                        destinationType: 0,
                                        sourceType: 0,
                                        saveToPhotoAlbum: true,
                                        popoverOptions: 0,
                                        cameraDirection: 1,
                                        encodingType: 0
                                    }
                                }, function (value, exception) {
                                    if (typeof exception !== "undefined") {
                                        console.log("call camera returned false");
                                        // console.log(exception);
                                        return;
                                    } else {
                                        console.log("call camera returned success");
                                    }
                                    $ele.attr("data-x-imgsrc", value);
                                    // imgsrc = value;
                                    var input = e.currentTarget;
                                    input.value = '';
                                    // 延后执行, 以便让data-x的同步先进行处理
                                    setTimeout(function () {
                                        $.wwclass.helper.anijsTrigger($ele, "getimg");
                                    }, 0);

                                });
                            };
                            setTimeout(function () {
                                // 调用手机相册
                                photoFun();
                            }, 0);
                        });
                    } else if (android == "Android" && model == "ANA-AN00" && version == 10) {
                        $ele.on("click", function (e) { //点击后
                            e.preventDefault();
                            e.stopPropagation();
                            $ele.data("value", "");
                            var photoFun1 = function () {
                                $.wwclass.callApp("camera", {
                                    method: "getPicture",
                                    cameraOptions: {
                                        quality: 50,
                                        mediaType: 0,
                                        destinationType: 0,
                                        sourceType: 0,
                                        saveToPhotoAlbum: true,
                                        popoverOptions: 0,
                                        cameraDirection: 1,
                                        encodingType: 0
                                    }
                                }, function (value, exception) {
                                    if (typeof exception !== "undefined") {
                                        console.log("call camera returned false");
                                        // console.log(exception);
                                        return;
                                    } else {
                                        console.log("call camera returned success");
                                    }
                                    $ele.attr("data-x-imgsrc", value);
                                    // imgsrc = value;
                                    var input = e.currentTarget;
                                    input.value = '';
                                    // 延后执行, 以便让data-x的同步先进行处理
                                    setTimeout(function () {
                                        $.wwclass.helper.anijsTrigger($ele, "getimg");
                                    }, 0);

                                });
                            };
                            setTimeout(function () {
                                // 调用手机相册
                                photoFun1();
                            }, 0);
                        });
                    } else {
                        //console.log(1111);
                        $ele.on("change", "input", function (e) {
                            var input = e.currentTarget;
                            console.log(e);
                            if (input.files && input.files[0]) {
                                scucessSelector(input.files[0]);
                            }
                        });
                    }
                });
            } else {
                // console.log( JSON.stringify(isWeiXin()));
                // console.log( "qita ");
                $ele.on("change", "input", function (e) {
                    var input = e.currentTarget;
                    // console.log("input---------"+JSON.stringify(input));
                    if (input.files && input.files[0]) {
                        // console.log('1');
                        $.wwclass.helper.updateProp($ele, "data-x-imgsrc", scucessSelector(input.files[0]));
                        // scucessSelector(input.files[0]);
                    }
                });
            }

        } else {
            $ele.on("change", "input", function (e) {
                var input = e.currentTarget;
                var multi = $ele.attr("data-multi");
                var mark = false;
                if (multi === "true") {
                    var arr = [];
                    if (input.files) {
                        // scucessSelector(input.files[0]);

                        var fileType = $(this).val();
                        if (!/\.(gif|jpg|jpeg|png|GIF|JPG|JPEG|PNG)$/.test(fileType)) {
                            alert("图片类型必须是.gif,jpeg,jpg,png,GIF,JPG,JPEG,PNG中的一种");
                            $(this).val('');
                            return false;
                        }
                        for (var i = 0; i < input.files.length; i++) {
                            // arr.push(scucessSelector(input.files[i]));
                            var reader = new FileReader();
                            reader.readAsDataURL(input.files[i]);
                            reader.onload = function (e) {
                                arr.push(e.target.result);

                                setTimeout(function () {
                                    //console.log(arr);
                                    var imgsrcarr = JSON.stringify(arr);
                                    //console.log(JSON.parse(imgsrcarr));
                                    $.wwclass.helper.updateProp($ele, "data-x-imgsrc", imgsrcarr);
                                    if (!mark) {
                                        $.wwclass.helper.anijsTrigger($ele, "getimg");
                                        mark = true;
                                    }

                                }, 500);

                            };
                        }

                    }

                } else {
                    if (input.files && input.files[0]) {
                        var fileType = $(this).val();
                        if (!/\.(gif|jpg|jpeg|png|GIF|JPG|JPEG|PNG)$/.test(fileType)) {
                            alert("图片类型必须是.gif,jpeg,jpg,png,GIF,JPG,JPEG,PNG中的一种");
                            $(this).val('');
                            return false;
                        }
                        $.wwclass.helper.updateProp($ele, "data-x-imgsrc", scucessSelector(input.files[0]));

                    }
                }
            });

        }
        //fix bug #XXXX see https://github.com/cdibened/filechooser
        //fix bug #XXX  see https://stackoverflow.com/questions/26732077/input-type-file-is-not-working-with-phonegap
        // } catch (e) {
        //     console.log(e);
        // }

    }

    // 元素析构——每个wwclass元素只会被析构一次。, 传入了元素对象($前缀表明是一个jquery对象).
    function finalizeElement($ele) {
        // 对 $ele 元素做对应处理
    }

    // 监听属性相关处理
    var evtInHandler = function ($ele, attribute, value) {
        // 处理代码
        switch (attribute) {
            /*case "data--show":
              // 添加处理动作
              break;*/
            case "finalize":
                finalizeElement($ele);
                break;
            default:
                console.info("监听到 " + attribute + " 属性值改变为 " + value + ", 但是没找到对应处理动作.");
        }
    };

    // 以下部分不需要修改
    if (!$.wwclass) {
        console.error("Can not use without wwclass.js");
        return false;
    }

    var ret = /*INSBEGIN:WWCLSHANDLER*/
        function (set) {
            if (set.length > 0) {
                loadDependence(function () {
                    init();
                    $(set).each(function (index, targetDom) {
                        processElement($(targetDom));
                    });
                });
            }
        }
        /*INSEND:WWCLSHANDLER*/
        ;

    return ret;

}));