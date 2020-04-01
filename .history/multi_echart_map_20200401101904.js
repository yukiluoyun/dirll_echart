var myMultiMap = function(obj){
    var that = this;
    console.log("myMultiMap=9");
    var mapChart = echarts.init(document.getElementById(obj.target));
    var  mapChart,mapOption;
    var mapName;  //江西省，，南昌市
    var placeCode; //渲染地图必须的地名号码参数
    var urlLevel;//渲染地图必须的行政等级参数
    var url; //渲染地图的拼接地址
    var curGeoJsonData = []; //当前行政区域的下一集子集对象
    var colorList = ['#00eaff','#f00',  '#ffde00', '#ffde00']; //地图上的颜色集
    var breadcrumbHtml = '';//地图导航变量
    var firstLoad = true;
    var tootipIndex = 0;
    var _firstLoad = sessionStorage.getItem('firstLoad'); //是否首次登陆
    var userCode = sessionStorage.getItem('userCode');   //用户名

    //初次渲染地图及热点，需要的参数
    if(/*!_firstLoad ||*/ !userCode || userCode != obj.userCode){
        urlLevel = obj.urlLevel;
        mapName = obj.mapName;
        placeCode = obj.placeCode;
        userCode = obj.userCode;
        sessionStorage.setItem('placeCode',placeCode);
        sessionStorage.setItem('urlLevel',urlLevel);
        sessionStorage.setItem('orgName',mapName);
        sessionStorage.setItem('treeName',mapName);
        sessionStorage.setItem('userCode',userCode);
        sessionStorage.setItem('breadcrumb','<span class="" data-level="'+urlLevel+'" data-placecode="'+placeCode+'" onclick="breadcrumbToggle(this)">'+mapName+'</span>');
    }

    //第一步，渲染地图
    this.renderEchart = function(addData){
        console.log("renderEchart==");
        firstLoad = false;
        sessionStorage.setItem("firstLoad",firstLoad);
        var _localLevel = sessionStorage.getItem("urlLevel");
        var _orgName = sessionStorage.getItem("orgName");
        var _breadcrumb = sessionStorage.getItem("breadcrumb");
        var _placeCode = sessionStorage.getItem("placeCode");
        if(_localLevel){
            urlLevel = _localLevel;
            mapName = _orgName;
        }
        if(!_placeCode){
            placeCode = placeCode;
        }else{
            placeCode = _placeCode;
        }
        // url = ctx+'/bigdata/listJson?level='+ urlLevel+ '&areaCode='+ placeCode;
        url = './json/listJsonlevel1areaCode360100.json'; //此例子暂时写死url，真实项目中用 
        if(_breadcrumb){
            $("#breadcrumb").html(_breadcrumb);
        }
        $.getJSON(url,function(geoJson){
            echarts.registerMap(mapName,geoJson);
            curGeoJsonData = geoJson.features;
            // $.multiMap.geoJson = geoJson.features;
            var areaGeoCoordMap = {};
            geoJson.features.map(function(item){
                areaGeoCoordMap[item.properties.name] =  item.properties.cp;
                return areaGeoCoordMap;
            });
            var areaData = [];
            if(addData.length > 0 ){
                console.log("addData.length==",addData.length);
                addData.map(function(areaItem){
                    for (var key in areaGeoCoordMap) {
                        if(areaItem.name == key){
                            var obj = {};
                            obj.name = areaItem.name;
                            obj.areaCode = areaItem.areaCode;
                            obj.value = areaGeoCoordMap[key];
                            obj.value.push(0); //光圈的大小基数
                            areaItem.value.map(function(valueItem){
                                obj.value.push(valueItem);
                            });
                            areaData.push(obj);
                            obj.value.push(areaItem.item);
                            return areaData;
                        }
                    }
                });
            }else{
                console.log("addData.length==",addData.length);
            }
            that.renderMapPoint(areaGeoCoordMap,areaData);
        });
        this.setBreadcrumb();
    };

    //第二步，渲染地图上的数据点
    this.renderMapPoint = function(areaGeoCoordMap,areaData){
        console.log("renderMapPoint");
        var series = [];
        [[mapName, areaData]].forEach(function (item, i) {
            series.push(
                {
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    hoverAnimation: true,
                    roam:true,
                    // showEffectOn: 'render',
                    zlevel: 1,
                    rippleEffect: { //涟漪特效
                        period: 10, //动画时间，值越小速度越快
                        brushType: 'fill', //波纹绘制方式 stroke, fill
                        scale: 6//波纹圆环最大限制，值越大波纹越大
                    },
                    label: {
                        normal: {
                            show: false,
                            color:'#fff',
                            position: 'right', //显示位置
                            offset: [5, 0], //偏移设置
                            formatter: function (params) {//圆环显示文字
                                return params.data.name;
                            },
                            fontSize: 13
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    symbol: 'circle',
                    symbolSize: function (val) {
                        return 7 + val[2] * 5; //圆环大小
                    },
                    symbolOffset:[0,15],
                    itemStyle: {
                        normal: {
                            show: false,
                            color:colorList[0],
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }

                    },
                    data: item[1]
                },
                {
                    name:mapName,
                    type:'map',
                    map: mapName,
                    geoIndex: 1,
                    zoom: 1.1,
                    roam: true, //是否允许缩放
                    label: {
                        normal:{
                            show: true,
                            color:'#c0ecff'
                        },
                        emphasis: {
                            show: true,
                            color:'#c0ecff'
                        }
                    },
                    itemStyle: {
                        normal: {
                            borderColor: 'rgba(82, 237, 255, 1)',
                            borderWidth: 1,
                            areaColor: {
                                type: 'radial',
                                x: 0.5,
                                y: 0.5,
                                r: 0.8,
                                colorStops: [{
                                    offset: 0,
                                    color: 'rgba(0, 20, 47, .2)' // 0% 处的颜色
                                }, {
                                    offset: 1,
                                    color: 'rgba(3, 117, 154, 1)' // 50% 处的颜色
                                }],
                                globalCoord: false
                                // 缺省为 false
                            },
                            shadowColor: 'rgba(0, 0, 0, .74)',
                            shadowOffsetX: -5,
                            shadowOffsetY: 5,
                            shadowBlur: 30
                        },
                        emphasis: {
                            areaColor: '#0381a7',
                            borderWidth: 0
                        }
                    },
                    data: item[1]
                }
            );
        });
        //地图配置项
        mapOption = {
            grid:{
                top:0,
                bottom:0
            },
            tooltip: {
                trigger: 'item',
                borderColor: '#4c889e',
                borderWidth: 1,
                backgroundColor: 'rgba(0,0,0,0.45)',
                showDelay: 0,
                hideDelay: 100,
                enterable: true,
                transitionDuration: 0,
                extraCssText: 'z-index:100',
                formatter: function (e) {
                    //根据业务自己拓展要显示的内容
                    if(e.data.value){
                        var len = e.data.value.length;
                        var str='<div>'+e.data.name+'</div>';
                        var tempData = [];
                        e.data.value.forEach(function(item,index){
                            if(index != 0 && index != 1 && index != 2  && index !=   e.data.value.length-1){ //排除经、纬度、等级值、项目
                                tempData.push(item);
                            }
                        });
                        var color = ["#00e9ff","#16d5b3","#f69d1f"];
                        for (var i = 0; i < tempData.length; i++) {
                            str+='<div style="height:32px;line-height:32px;color:'+ color[i]+';min-width:150px;">\n' +
                                '<div style="float:left;">\n'  +
                                '<i style="vertical-align:top; display:inline-block;margin:13px 6px 0 0; width:8px;height:8px;background-color:'+ color[i]+';border-radius:50%;"></i>\n'
                                +e.data.value[len-1][i]+
                                '</div>\n' +
                                '<div style="float:right;">\n'
                                +tempData[i]+
                                '</div>\n'  +
                                '</div>';
                        }
                        return str;
                    }
                }
            },
            geo: {
                map: mapName,
                zoom: 1.1,
                roam: true, //是否允许缩放
                itemStyle: {
                    normal: {
                        areaColor: 'transparent',
                    },
                    emphasis: {
                        areaColor: 'transparent',
                        borderWidth: 0
                    }
                },
            },
            series: series
        };

        mapChart.setOption(mapOption);

        mapChart.dispatchAction({type: 'showTip',seriesIndex: 0,dataIndex: 2});//设置默认选中高亮部分

        //捕捉georoam事件，使下层的geo随着上层的geo一起缩放拖曳
        mapChart.on('georoam',function(params) {
            var option = mapChart.getOption();//获得option对象
            if (params.zoom != null && params.zoom != undefined) { //捕捉到缩放时
                option.geo[0].zoom = option.series[1].zoom;//下层geo的缩放等级跟着上层的geo一起改变
                option.geo[0].center = option.series[1].center;//下层的geo的中心位置随着上层geo一起改变
            } else {//捕捉到拖曳时
                option.geo[0].center = option.series[1].center;//下层的geo的中心位置随着上层geo一起改变
            }
            mapChart.setOption(option);//设置option
        });
    };

    //点击地图，进入下一层行政区域
    this.mapToNext = function(params){
        console.log("mapToNext----");
        var hasAreaCodeFlag = true;
        if(urlLevel == 4 ){
            layer.alert("该区域已无下属行政区域。。。");
            return;
        }else{
            console.log("urlLevel !-4---");
            curGeoJsonData.map(function(item){ //当前大图数据，与点击的地图区域对比
                if(item.properties.name === params.name){
                    // if(!item.properties.areaCode || item.properties.areaCode =="" ||  item.properties.areaCode =="null" || item.properties.areaCode =="Undefined"  ){
                    if(!item.properties.areaCode  ){
                        layer.alert("该区域暂无数据。。。");
                        hasAreaCodeFlag = false;
                        return
                    }else{
                        return placeCode = item.properties.areaCode;
                    }

                }
            });

            if(hasAreaCodeFlag){
                var nextLever = (urlLevel-0) + 1;
                that.toggleParams(nextLever,placeCode,params.name);
            }
        }
    };

    //点击导航，切换行政区域
    this.breadcrumbToggle = function(obj){
        var breadcrumbLeverl = $(obj).attr("data-level");
        var breadcrumbPlaceCode =  $(obj).attr("data-placeCode");
        var breadcrumbName =  $(obj).text();
        if(breadcrumbLeverl == 4){
            //layer.alert("已经是第五级了，没有下级数据了");
            return;
        }else{
            that.toggleParams(breadcrumbLeverl,breadcrumbPlaceCode,breadcrumbName);
        }
    };

    window.breadcrumbToggle =  this.breadcrumbToggle;

    //根据情景，动态显示导航
    this.setBreadcrumb = function(){
        console.log("setBreadcrumb=");
        var hasName = false;  //没有重复的名字，即第一次打开此地图地图
        $("#breadcrumb span").each(function(index,el){
            if(  $(el).text() == mapName){
                hasName = true;
            }
            if( $(el).attr("data-level") > urlLevel){
                $(el).remove();
            }
        });
        if( !hasName){
            $("#breadcrumb").append('<span class="child" data-level="'+ urlLevel +'" data-placeCode="'+ placeCode +'" onclick="breadcrumbToggle(this)">'+ mapName +'</span>');
        }
        $("#breadcrumb").find("span:first").removeClass("child");
    };



    //点击，更换参数
    this.toggleParams = function(urlLevel,placeCode,mapName){
        mapChart.clear();
        sessionStorage.setItem("urlLevel",urlLevel);
        sessionStorage.setItem("placeCode",placeCode);
        sessionStorage.setItem("orgName",mapName);
        that.getData();
        // that.renderEchart(addData);  //此时不加载地图，因为在调用页面更改数据后，紧接着再	$.multiMap.init，所以这里渲染地图步骤省略
        that.setBreadcrumb();
        breadcrumbHtml  = "";
        breadcrumbHtml  = $("#breadcrumb").html();
        sessionStorage.setItem("breadcrumb",breadcrumbHtml);
    };

    //推点，警报点
    this.addWarnData = function(obj){
        obj =  {name:'报警',value:[117.0799,29.7006,2]};
        mapOption.series[0].data.push(obj);
        mapOption.series[0].itemStyle.normal.color = function(params){
            return colorList[params.data.value[1]]
        };
        mapChart.setOption(mapOption);
    };

    this.getData = function(){};

    //初始化
    this.init = function(addData){
        console.log("进入了init123");
        this.renderEchart(addData);
        mapChart.on('click', this.mapToNext);
    };

};

// 点击地图获取区域treeName
// function getTreeNameByMap(clickName) {
// 	var pName = sessionStorage.getItem("treeName");
// 	var treeName = pName + "/" +clickName;
//     sessionStorage.setItem("treeName",treeName);
//     getDataValid();
//     if (dataValid) {
//     	// 开启校验时
//     	if (!returnVal) {
//     		// 没有下级数据时存储本级treeName
//     		sessionStorage.setItem("treeName",pName);
//     	}
//     }
// }

// // 点击导航获取区域treeName
// function getTreeNameByTab(clickName) {
//     var pName = sessionStorage.getItem("treeName");
//     var index = pName.indexOf(clickName);
//     var treeName = pName.substring(0,index+clickName.length);
//     sessionStorage.setItem("treeName",treeName);
//     getDataValid();
// }


// // 数据校验(true：下级无数据时禁止钻取)
// var dataValid = false;
// // 判断否有数据
// var returnVal = true;
// // 获取区域信息
// function getDataValid() {
// 	var areaName = sessionStorage.getItem("treeName");
// 	$.ajax({
//         type: 'get',
//         contentType: 'application/json;charset=UTF-8',
//         cache: false,
//         async: false,
//         url: ctx+"/bigdata/getDataValid?placeName="+areaName,
//         success: function (result) {
//             console.log("result==",result);
//     		if (result.length > 1) {
//     			// 有父/子级数据
//     			sessionStorage.setItem("placeCode",result[0].area_code);
//     			returnVal = true;
//     		} else if (result.length == 1) {
//     			// 只有父级数据
//     			if (!dataValid) {
//     				sessionStorage.setItem("placeCode",result[0].area_code);
//     			}
//     			returnVal = false;	
//     		} else {
//     			// 无数据
//     			if (!dataValid) {
//     				sessionStorage.setItem("placeCode","");
//     			}
//     			returnVal = false;	
//     		}
//         }
//     })
//     return returnVal;
// }



