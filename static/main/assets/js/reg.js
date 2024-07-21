const ALIVE_TIME = 1000;
const LOGIN_RETRY_TIME = 1000;
const baseAddress = 'https://laubersberg.de/brewserver';
const PLOT_TIME=5000;
var formFilled=false;
const baseUrl = 'https://laubersberg.de/brewserver';

var uid=null;

$( document ).ready(function(){

    function f(){
        $.ajax({
            url: baseAddress + '/login/'
        }).done(function( json ) {
            uid = json['uuid'];
            loggedIn(uid);
        }).fail(function(a,textStatus){
            console.log("fail");
            setTimeout( f, LOGIN_RETRY_TIME );
        });
    }

    plotInit();
    f();

});


function activatButtons(active){

    document.querySelectorAll('.auth').forEach(function(e){
       e.disabled=!active; 
    });
    if(active){
        document.getElementById("pass").value= "";
    }
}

function loggedIn(uid){
    // setTimeout( stayAlive , ALIVE_TIME);
    getFullStatus(uid);
    plotReload();

}

function login(uid){

    $.ajax({
        url: baseAddress + '/login/',
        method: "POST",
        data: JSON.stringify({ uuid : uid }),
        dataType: "text",
    }).fail(function(a,textStatus){
        console.log("fail");
        setTimeout(function(){ login(uid)}, LOGIN_RETRY_TIME );
    });

}

function getFullStatus(uid){
    var http_stat = 0;
    $.ajax({
        url: baseAddress + '/status/',
        method: "POST",
        data: JSON.stringify({ uuid : uid }),
        dataType: "text",
        success : function( data, stat, jqXHR ) {
            if( jqXHR.status == 200 ){
                reload(JSON.parse(data));
                console.log("A")
                if(!formFilled){
                    fillInForm(JSON.parse(data));
                    formFilled=true;
                }
                console.log("200");
            listenToServer(uid);
            }else{
                setTimeout( function(){getFullStatus(uid)}, LOGIN_RETRY_TIME );
            }
        }
    }).fail(function(a,textStatus){
        console.log("fail");
        setTimeout( function(){getFullStatus(uid)}, LOGIN_RETRY_TIME );
    });
}

function getFullStatusOnce(uid){
    var http_stat = 0;
    $.ajax({
        url: baseAddress + '/client-get',
        method: "POST",
        data: JSON.stringify({ uuid : uid }),
        dataType: "text",
        success : function( data, stat, jqXHR ) {
            if( jqXHR.status == 200 ){
                reload(JSON.parse(data));
                if(!formFilled){
                    fillInForm(JSON.parse(data));
                    formFilled=true;
                }
                console.log("200");
            }else{
                setTimeout( function(){getFullStatus(uid)}, LOGIN_RETRY_TIME );
            }
        }
    }).fail(function(a,textStatus){
        console.log("fail");
        setTimeout( function(){getFullStatus(uid)}, LOGIN_RETRY_TIME );
    });
}

function listenToServer(uid){
    var http_stat = 0;
    $.ajax({
        url: baseAddress + '/status/listen/',
        method: "POST",
        data: JSON.stringify({ uuid : uid }),
        dataType: "text",
        success : function( data, stat, jqXHR ) {
            if( jqXHR.status == 200 ){
                reload(JSON.parse(data));
                if(!formFilled){
                    fillInForm(JSON.parse(data));
                    formFilled=true;
                }
            }
            listenToServer(uid);
        },
        error : function(jqXHR , textStatus , errThrown){
            if(jqXHR.status == 401){
                login(uid);
            }
            console.log("fail");
            setTimeout( function(){listenToServer(uid)}, LOGIN_RETRY_TIME );

        }
               });
}

function stayAlive(){
    $.ajax({
        url: baseAddress + '/alive',
        method: "POST",
        data: JSON.stringify({ uuid : uid }),
        dataType: "text"
    });
    setTimeout( stayAlive , ALIVE_TIME);
}



var chart ;
function plotInit(){


 chart= echarts.init(document.getElementById('chart'));

option = {
        tooltip: {
            trigger: 'axis',
            formatter:function(params){
                var str =  dtformatter(params[0].value[0]) ;
                var p;
                for( p in params){
                    if(params[p].seriesIndex == 0 ){
                        str+= " : " + params[p].value[1]+"°C" ;
                    } else if (params[p].seriesIndex == 1 ){
                         str +=  " : " +  params[p].value[1]+"°P"; 

                    } else if (params[p].seriesIndex == 2 ){
                         str += " : " + params[p].value[1]+"" ;

                    } else if (params[p].seriesIndex == 3 ){
                        str +=  " : " + params[p].value[1]+"°C" ;

                   }
                   else if (params[p].seriesIndex == 4 ){
                    str +=  " : " + params[p].value[1]+"°C" ;

                    }



                }
                return str;
            },
        // formatter: function (params) {
        //     params = params[0];
        //     var date = new Date(params.name);
        //     return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
        // },
        axisPointer: {
            animation: false
        }
    },
    xAxis: {
        type: 'time',
        minorTick:{
            show: true
        },
        nameTextStyle:{
            rich: {
                height: 1000
            }
        },
        axisLabel:{
// padding: [3, 4, 100, 6],
            formatter:function(value , index){
                return dtformatter(value)
            }
        },
        splitLine: {
            show: false
        }
    },
    yAxis: [{
        type: 'value',
        minorTick:{
            show: true
        },
        scale: true,
        minInterval: 1,

        boundaryGap: [0, '100%'],
        splitLine: {
            show: false
        }
    },
{
        type: 'value',
        minorTick:{
            show: true
        },
        scale: true,
        minInterval: 1,

        boundaryGap: [0, '100%'],
        splitLine: {
            show: false
        }
    }],

dataZoom: [{
        type: 'inside',
        start: 0,
        end: 100
    }, {
        start: 0,
        end: 100,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
        }
    }],
    legend:{
        selected: {
            'Temp': true,
            'Stell': false,
            'Soll': false,
            'Dichte' : false,
            'tilt_temp': false
        }
    },
    series: [{
        name: 'Temp',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        yAxisIndex : 0,
        data: plotDataTemp
    },{
        name: 'Dichte',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        yAxisIndex : 1,
        data: plotDataGrav
    },{
        name: 'Stell',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        yAxisIndex : 1,
        data: plotDataStell
    },{
        name: 'Soll',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        yAxisIndex : 0,
        data: plotDataSoll
    },{
        name: 'Tilt temp',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        yAxisIndex : 0,
        data: plotDataTiltTemp
    },

    ]
};
        // use configuration item and data specified to show chart
        chart.setOption(option);
}

function reload(data) {
  if ( data.online) {
        document.getElementById("img_online").src=baseUrl + "/static/main/images/online.png";
    }else{
        document.getElementById("img_online").src=baseUrl + "/static/main/images/offline.png";
    }
    if ('authorized' in data && data.authorized ){
        activatButtons(true)
        document.getElementById("pw_submit").value="Logout"
    }else{
        activatButtons(false)
        document.getElementById("pw_submit").value="Login"
    }
    if(data.temp_profile == null){
        document.getElementById("temp_pofile_start_row").hidden=true
    }else{
        document.getElementById("temp_pofile_start_row").hidden=false
        document.getElementById("temp_pofile_file").innerHTML=data.temp_profile;
    }
     if(data.temp_profile_running == true){
        document.getElementById("temp_profile_running").style.display = 'block';
        document.getElementById("temp_profile_step").innerHTML='step: '+data.temp_profile_status.current_temp+
                    "&deg;C/"+Math.floor(data.temp_profile_status.current_time/60)+':'+
                    ('00'+data.temp_profile_status.current_time%60).slice(-2);

        if(data.temp_profile_status.next_temp!=null){
            document.getElementById("temp_profile_next").innerHTML='next: '+data.temp_profile_status.next_temp+
                    "&deg;C/"+Math.floor(data.temp_profile_status.next_duration/60)+':'+
                    ('00'+data.temp_profile_status.next_duration%60).slice(-2);
        }else{
                    document.getElementById("temp_profile_next").innerHTML='next: done';
        }
    }else{
         document.getElementById("temp_profile_running").style.display = 'none';
    }
    document.getElementById("tab_zeit").innerHTML=data.time;
    document.getElementById("tab_temp").innerHTML=data.temp.toFixed(2)+"&deg;C";
    document.getElementById("divTemp").innerHTML=data.temp.toFixed(2)+"&deg;C";
	if(data.tilt_grav!=null){
		document.getElementById("divGrav").innerHTML=data.tilt_grav.toFixed(1)+"&deg;P";
	}
    if(data.tilt_temp!=null){
		document.getElementById("divGravTemp").innerHTML=data.tilt_temp.toFixed(1)+"&deg;C";
	}
    if(data.wort!=null){
        e=(1-(data.wort - data.tilt_grav)/data.wort*0.81)*data.wort
        console.log("e"+e)
		document.getElementById("divABV").innerHTML=( (e-data.wort)/(data.wort*1.0665/100-2.0665)/0.795 ).toFixed(1)+" Vol. % alc.";
	}

	if(data.ntc1!=null){
		document.getElementById("divntc1").innerHTML="NTC: "+data.ntc1+"°C"
	}

	if(data.ntc2!=null){
		document.getElementById("divntc2").innerHTML="Board: "+data.ntc2+"°C"
	}
	
    document.getElementById("tab_soll").innerHTML=data.set_point+"&deg;C";
    document.getElementById("tab_soll").innerHTML=data.set_point+"&deg;C";
    document.getElementById("tab_target").innerHTML=data.target+"&deg;C";
    document.getElementById("tab_kp").innerHTML=data.k_p;
    document.getElementById("tab_ki").innerHTML=data.k_i;
    document.getElementById("tab_stell").innerHTML=data.actuating_value.toFixed(2);
    document.getElementById("tab_err").innerHTML=data.err.toFixed(2);
    document.getElementById("tab_i_err").innerHTML=data.i_err.toFixed(2);
    document.getElementById("tab_power").innerHTML=data.power+"%";
    document.getElementById("tab_ramp").innerHTML=data.ramp+" K/min";
	if(data.tilt_temp!=null){
		document.getElementById("tab_ttemp").innerHTML=data.tilt_temp.toFixed(1)+" &deg;C";
	}

    if ( data.stirrer ) {
        document.getElementById("img_rw").src=baseUrl + "/static/main/images/prop.gif";
    }else if (! data.stirrer) {
        document.getElementById("img_rw").src=baseUrl + "/static/main/images/prop_grey.svg";
    }
    if ( data.cooler  ) {
        document.getElementById("img_cooler").src=baseUrl + "/static/main/images/cooler_on.svg";
    }else if ( ! data.cooler) {
        document.getElementById("img_cooler").src=baseUrl + "/static/main/images/cooler_off.svg";
    }
    if ( data.heater  ) {
        document.getElementById("img_heater").src=baseUrl + "/static/main/images/heater.png";
    }else if ( !data.heater ) {
        document.getElementById("img_heater").src=baseUrl + "/static/main/images/heater_off.png";
    }
    if ( data.reg ) {
        document.getElementById("button_reg").style.background='#FF0000';
        document.getElementById("button_heater").style.background='#FFFFFF';
        document.getElementById("button_off").style.background='#FFFFFF';
        document.getElementById("button_cooler").style.background='#FFFFFF';

        if ( data.frozen) {
            document.getElementById("button_freeze").style.background="#FF0000";
        }else{
            document.getElementById("button_freeze").style.background="#FFFFFF";
        }
    }else if ( !data.reg ) {
        document.getElementById("button_reg").style.background='#FFFFFF';
        if ( data.heater) {
            document.getElementById("button_heater").style.background='#FF0000';
        }else{
            document.getElementById("button_heater").style.background='#FFFFFF';
        }
        if ( data.cooler) {
            document.getElementById("button_cooler").style.background='#FF0000';
        }else{
            document.getElementById("button_cooler").style.background='#FFFFFF';
        }
        if( !data.heater && !data.cooler){
            document.getElementById("button_off").style.background='#FF0000';
        } else{

            document.getElementById("button_off").style.background='#FFFFFF';
        }

            document.getElementById("button_freeze").style.background="#FFFFFF";
        

        // document.getElementById("button_reg").disabled = false;
        // document.getElementById("button_reg").innerHTML = "Ein";
    }

        document.getElementById("button_reg").disabled = false;
        document.getElementById("button_heater").disabled = false;
        document.getElementById("button_cooler").disabled = false;
        document.getElementById("button_off").disabled = false;


  }


function fillInForm(data)
{
        document.getElementById("input_soll").value=data.target;
        document.getElementById("input_kp").value=data.k_p;
        document.getElementById("input_ki").value=data.k_i;
        document.getElementById("input_ramp").value=data.ramp;
}


function sendCommand(cmd,alwaysFnc){
$.ajax({
        url: baseAddress + '/commands/send/',
        method: "POST",
        data: cmd,
        dataType: "text"
    }).always(alwaysFnc);
}

function ctlButton(cmd){
    document.getElementById("button_reg").disabled = true;
    document.getElementById("button_heater").disabled = true;
    document.getElementById("button_cooler").disabled = true;
    document.getElementById("button_off").disabled = true;
    sendCommand({
            "uuid" : uid ,
            "cmd": encodeURIComponent(JSON.stringify(cmd))
        },function () {
        
    })
}

function profile_button(cmd){
    sendCommand({
            "uuid" : uid ,
            "profile": cmd
        },function(){})
}


function period(){
        // document.getElementById("button_reg").disabled = true;
    var input = window.prompt("Period","10.0");

    var set= confirm("set period"+parseFloat(input)+"?");
    if(!set){
        return;
    }
        cmd = {
            "period":""+parseFloat(input),
        }
        cmd=encodeURIComponent(JSON.stringify(cmd))
 $.ajax({
        url: baseAddress + '/commands/send/',
        method: "POST",
        data: {
            "uuid" : uid ,
            "cmd": cmd
        },
        dataType: "text"
    });
        
}

function freeze(onOff){
    // document.getElementById("button_reg").disabled = true;

    var cmd;

    if(onOff){
        document.getElementById("button_freeze").onclick=function() { freeze(false); };
        cmd= {
            "freeze":"true"
        }
    }else{ 
        document.getElementById("button_freeze").onclick=function() { freeze(true); };
        cmd= {
            "freeze":"false"
        }
    }

        cmd=encodeURIComponent(JSON.stringify(cmd))
    $.ajax({
        url: baseAddress + '/commands/send/',
        method: "POST",
        data: {
            "uuid" : uid ,
            "cmd": cmd
        },
        dataType: "text"
    });

}

function rampUp(){
    cmd={
"soll":document.getElementById("input_soll").value,
"k_p":document.getElementById("input_kp").value,
"k_i":document.getElementById("input_ki").value,
"ramp":document.getElementById("input_ramp").value,
"rampUp":true
    }

        cmd=encodeURIComponent(JSON.stringify(cmd))
 $.ajax({
        url: baseAddress + '/commands/send/',
        method: "POST",
        data: {
            "uuid" : uid ,
            "cmd": cmd
        },
        dataType: "text"
    });


        window.scrollTo(0,0);
}


function changeParameters(){
    cmd={
"soll":document.getElementById("input_soll").value,
"k_p":document.getElementById("input_kp").value,
"k_i":document.getElementById("input_ki").value,
"ramp":document.getElementById("input_ramp").value,
    }

        cmd=encodeURIComponent(JSON.stringify(cmd))
 $.ajax({
        url: baseAddress + '/commands/send/',
        method: "POST",
        data: {
            "uuid" : uid ,
            "cmd": cmd
        },
        dataType: "text"
    });


        window.scrollTo(0,0);
}

function loginPW(){

if( document.getElementById("pw_submit").value=="Login"){
     $.ajax({
            url: baseAddress + '/login/',
            method: "POST",
            data: {
                "uuid" : uid ,
                "passwd":document.getElementById("pass").value
            },
            dataType: "text"
        }).done(function(){
            getFullStatusOnce(uid)
        });
    }else{

     $.ajax({
            url: baseAddress + '/logout/',
            method: "GET",
        }).done(function(){
            getFullStatusOnce(uid)
        });
    }

        window.scrollTo(0,0);
}

function ctlReset(){

    cmd= {
        "reset":"true"
    }

        cmd=encodeURIComponent(JSON.stringify(cmd))
    $.ajax({
        url: baseAddress + '/commands/send/',
        method: "POST",
        data: {
            "uuid" : uid ,
            "cmd": cmd
        },
        dataType: "text"
    });
}

function ctlSetI(){
    // document.getElementById("button_reg").disabled = true;
    var input = window.prompt("i_err","0.0");

    var set= confirm("set i_err to "+parseFloat(input)+"?");
    if(!set){
        return;
    }
    cmd= {
        "setI":""+parseFloat(input),
    }
        cmd=encodeURIComponent(JSON.stringify(cmd))

    $.ajax({
        url: baseAddress + '/commands/send/',
        method: "POST",
        data: {
            "uuid" : uid ,
            "cmd": cmd
        },
        dataType: "text"
    });
}


function newFile(){
    var d = new Date(Date.now()),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
        hours=d.getHours();
        minutes=d.getMinutes();
        seconds=d.getSeconds();


    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

   dateString= [year, month, day].join('-');
    dateString+="_" + [hours,minutes,seconds].join(':');


    // document.getElementById("button_reg").disabled = true;
    var filename= window.prompt("Dateiname",dateString);

  
    $.ajax({
        url: baseAddress + '/data_logger/newfile/',
        method: "POST",
        data: {
            "filename": filename
        },
        dataType: "text"
    });
}


function rw(t){
    var cmd;
    if(t){
        dc=document.getElementById("input_rw").value;
        cmd = {
            "stirrer":dc,
        }
      

    }else{

        cmd= {
            "stirrer":"off",
        }
    }

        cmd=encodeURIComponent(JSON.stringify(cmd))
   $.ajax({
        url: baseAddress + '/commands/send/',
        method: "POST",
        data: {
            "uuid" : uid ,
            "cmd": cmd
        },
        dataType: "text"
    });


}



var plotDataTemp=[];
var plotDataStell=[];
var plotDataGrav=[];
var plotDataSoll=[];
var plotDataTiltTemp=[];
var plotTime=0;
function plotReload(){

    var d;

    if(csvFile==null){
        d={
            "timestamp": plotTime,
            "filename":''
        };
        console.log(plotTime)
    }else{
        d={
            "timestamp": plotTime,
            "filename" : csvFile
        };
        console.log("B")
    }

    $.ajax({
        url: baseAddress + '/data_logger/',
        method: "POST",
        data: d,
        dataType: "text"
        }).done(function( data) {
            json = JSON.parse(data);
            console.log(json);
            plotTime=json.time;
            for(row of json["data"]){
                plotDataTemp.push([row[0],row[3]]);
                plotDataStell.push([row[0],row[1]]);
                plotDataGrav.push([row[0],row[4]]);
                plotDataSoll.push([row[0],row[2]]);
                plotDataTiltTemp.push([row[0],row[5]]);
            }
            
            // plotData.pop();
            updatePlot();
        }).fail(function(a,textStatus){
        }).always(function(){

            if(csvFile==null){
                setTimeout( plotReload, PLOT_TIME);
            }
        });


}
csvFile=null;
function selectFile(){
    plotTime=0;
plotDataTemp=[];
plotDataStell=[];
plotDataGrav=[];
plotDataSoll=[];
plotDataTiltTemp=[];
    f=document.getElementById("file").value;

    if (f=="Aktuell"){
        csvFile=null;
    }else{
        csvFile=f;
    }
    plotReload();
}

function selectTimeRange(){
    r=document.getElementById("timeRange").value;
    if(r == 0 ) {
       idx=0; 
    }else{
        idx = plotDataTemp.findIndex(element => element[0] > plotDataTemp[plotDataTemp.length-1][0] - r)+1;
    }

    updatePlot();
}

var idx=0;
function dataRange(r){
    if(r == 0 ) {
       idx=0; 
    }else{
        idx = plotDataTemp.findIndex(element => element[0] > plotDataTemp[plotDataTemp.length-1][0] - r)+1;
    }

    updatePlot();
}

function getData(i){
    if(i==0){
        return plotDataTemp.slice(idx);
    }else if(i==1){
        return plotDataStell.slice(idx);
    }else if(i==2){
        return plotDataSoll.slice(idx);
    }else if(i==3){
        return plotDataGrav.slice(idx);
    }else if(i==4){
        return plotDataTiltTemp.slice(idx);
    }


}
function updatePlot(){
       chart.setOption({
        series: [{
            data: getData(0)
        },{
            data:getData(3) 
        },{
            data:getData(1) 
        },{
            data:getData(2) 
        },{
            data:getData(4) 
        }]
    });
}

 function dtformatter (value ){
            d=new Date(value*1000)
            const dateFormatter= new Intl.DateTimeFormat('de', { day: '2-digit' , month: 'numeric', year: 'numeric' }); 
            const timeFormatter= new Intl.DateTimeFormat('de', {hour: 'numeric', minute: 'numeric'}); 
            return dateFormatter.format(d)+"\n"+timeFormatter.format(d);
        }

        
function load_temp_profile_dropdown(){
    var select = document.getElementById("temp_profile")
    var length = select.options.length;
    for (i = length-1; i >= 0; i--) {
        select.options[i] = null;
    }
    var option = document.createElement("option");
    option.text = "Please Wait";
    select.add(option); 

    console.log("select");
    $.ajax({
        url: baseAddress + '/t_profiles/get/',
        method: "GET",
        dataType: "text"
        }).done(function( data) {
            json = JSON.parse(data);
            
            length = select.options.length;
            for (i = length-1; i >= 0; i--) {
                select.options[i] = null;
            }
            
            for(profile of json["profiles"]){
                var option = document.createElement("option");
                option.text = profile;
                select.add(option); 
            }
            
            
           
        }).fail(function(a,textStatus){
        }).always(function(){
        });
}


function load_logfile_dropdown(){
    var select = document.getElementById("file")
    var length = select.options.length;
    for (i = length-1; i >= 0; i--) {
        select.options[i] = null;
    }
    var option = document.createElement("option");
    option.text = "Please Wait";
    select.add(option);

    console.log("select");
    $.ajax({
        url: baseAddress + '/data_logger/logfiles/',
        method: "GET",
        dataType: "text"
        }).done(function( data) {
            json = JSON.parse(data);

            length = select.options.length;
            for (i = length-1; i >= 0; i--) {
                select.options[i] = null;
            }

            var option = document.createElement("option");
            option.text = "Aktuell";
            option.value = "Aktuell";
            select.add(option);
            for(profile of json["logfiles"]){
                var option = document.createElement("option");
                option.text = profile;
                select.add(option);
            }



        }).fail(function(a,textStatus){
        }).always(function(){
        });
}

function load_temp_profile(){
    
    d={ file: document.getElementById("temp_profile").value };

    
    
    $.ajax({
        url: baseAddress + '/t_profiles/load/',
        method: "POST",
        data: d,
        dataType: "text"
        }).done(function( data) {  
        }).fail(function(a,textStatus){
        }).always(function(){
        });
    
}



function start_temp_profile(){
    

    $.ajax({
        url: baseAddress + '/t_profiles/start/',
        method: "GET",
        dataType: "text"
        }).done(function( data) {  
        }).fail(function(a,textStatus){
        }).always(function(){
        });
    
}

function openDebugView(){
    e=document.getElementById("debugTable")
    if(e.hidden){
        e.hidden=false
    }
    else{
        e.hidden=true
    }

}
